---
description: Reuse compiled code across concurrent calls and shut a long-lived Wago runtime down cleanly.
---

# Run Wago in a service

Compile during service startup, then give each concurrent request its own instance. The requests share native code while keeping guest memory, tables, and globals isolated.

Use the `fib.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/wago-org/wago"
)

type Service struct {
	runtime *wago.Runtime
	module  *wago.Module
}

func NewService(wasm []byte) (*Service, error) {
	runtime := wago.NewRuntime()
	module, err := runtime.Compile(wasm)
	if err != nil {
		_ = runtime.Close()
		return nil, err
	}
	return &Service{runtime: runtime, module: module}, nil
}

func (s *Service) Fib(ctx context.Context, value int32) (int32, error) {
	instance, err := s.runtime.Instantiate(ctx, s.module)
	if err != nil {
		return 0, err
	}
	defer instance.Close()

	results, err := instance.Call(ctx, "fib", wago.ValueI32(value))
	if err != nil {
		return 0, err
	}
	return results[0].I32(), nil
}

func (s *Service) Close(ctx context.Context) error {
	return errors.Join(s.module.Close(), s.runtime.CloseContext(ctx))
}

type response struct {
	line string
	err  error
}

func run() error {
	wasm, err := os.ReadFile("fib.wasm")
	if err != nil {
		return err
	}
	service, err := NewService(wasm)
	if err != nil {
		return err
	}
	defer func() { _ = service.Close(context.Background()) }()

	jobs := []int32{10, 20, 30}
	responses := make(chan response, len(jobs))
	var group sync.WaitGroup
	for _, value := range jobs {
		group.Add(1)
		go func() {
			defer group.Done()
			result, err := service.Fib(context.Background(), value)
			responses <- response{
				line: fmt.Sprintf("fib(%d) = %d", value, result),
				err:  err,
			}
		}()
	}
	group.Wait()
	close(responses)

	var lines []string
	for result := range responses {
		if result.err != nil {
			return result.err
		}
		lines = append(lines, result.line)
	}
	sort.Strings(lines)
	for _, line := range lines {
		fmt.Println(line)
	}

	shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return service.Close(shutdown)
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
```

```sh
go run .
go test -race ./...
```

```text
fib(10) = 55
fib(20) = 6765
fib(30) = 832040
```

An individual instance accepts one call at a time. Create a fresh instance per request when state should not survive. If state must persist, assign that instance to one worker and serialize access to it.

At shutdown, stop admitting requests, wait for active calls, close persistent instances, close modules, and then call `Runtime.CloseContext`. `Runtime.Close` starts shutdown and may finish asynchronously when callbacks or active work are involved; use `CloseContext` when the service must wait for the final result.
