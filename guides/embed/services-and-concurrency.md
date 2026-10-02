---
description: Reuse compiled code across concurrent calls and shut a long-lived Wago runtime down cleanly.
---

# Run Wago in a service

Compile during service startup, then give each concurrent request its own instance. The requests share native code while keeping guest memory, tables, and globals isolated.

Use the `module.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"slices"
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

func (s *Service) Add(ctx context.Context, a, b int32) (int32, error) {
	instance, err := s.runtime.Instantiate(ctx, s.module)
	if err != nil {
		return 0, err
	}
	defer instance.Close()

	if slices.Contains(s.module.Exports(), "_initialize") {
		if _, err := instance.InvokeContext(ctx, "_initialize"); err != nil {
			return 0, err
		}
	}

	results, err := instance.InvokeContext(ctx, "add", wago.I32(a), wago.I32(b))
	if err != nil {
		return 0, err
	}
	return wago.AsI32(results[0]), nil
}

func (s *Service) Close(ctx context.Context) error {
	return errors.Join(s.module.Close(), s.runtime.CloseContext(ctx))
}

type response struct {
	line string
	err  error
}

func run() error {
	wasm, err := os.ReadFile("module.wasm")
	if err != nil {
		return err
	}
	service, err := NewService(wasm)
	if err != nil {
		return err
	}
	defer func() { _ = service.Close(context.Background()) }()

	jobs := [][2]int32{{1, 2}, {3, 4}, {20, 22}}
	responses := make(chan response, len(jobs))
	var group sync.WaitGroup
	for _, value := range jobs {
		group.Add(1)
		go func() {
			defer group.Done()
			result, err := service.Add(context.Background(), value[0], value[1])
			responses <- response{
				line: fmt.Sprintf("add(%d, %d) = %d", value[0], value[1], result),
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

Run the program normally, then with Go's race detector. The second command needs a platform supported by Go's race detector, cgo enabled, and a C compiler on `PATH`; the ordinary embedding program does not require a C compiler.

```sh
go run .
go run -race .
```

```text
add(1, 2) = 3
add(20, 22) = 42
add(3, 4) = 7
```

Calls on an individual instance are serialized, including while a call is inside a host callback. Separate instances allow independent requests to run concurrently. The race-enabled command runs this actual program; `go test -race` alone would not exercise a project with no tests. Create a fresh instance per request when state should not survive. If state must persist, assign that instance to one worker and serialize access to it.

At shutdown, stop admitting requests, wait for active calls, close persistent instances, close modules, and then call `Runtime.CloseContext`. `Runtime.Close` starts shutdown and may finish asynchronously when callbacks or active work are involved; use `CloseContext` when the service must wait for the final result.

## Choose what can survive a request

A fresh instance starts with the module's initial memory, tables, and globals. The compiled module is reusable, but a `.wago` artifact does not save a running instance's state.

Wago currently has no public instance snapshot, restore, reset, or ready-made instance pool API. If you keep a worker's instance alive, its mutations survive every call, including mutations made before an error or cancellation. Only reuse it across requests when that is part of the guest's contract. For request isolation, instantiate again from the same module.

The isolation in this example covers guest-owned state. Explicitly imported memory or tables can be shared, and host callbacks may close over shared Go state. Protect that state with the same synchronization you would use in any other concurrent Go code.

## Wait for shutdown without deadlocking

`Instance.Close` publishes a logical close: new calls fail, while admitted work and close callbacks finish before resources are reclaimed. Use `Instance.WaitClosed(ctx)` after `Close` for the close operation's result. It does not wait for physical release still held by active calls or retained references; drain your application's calls separately. A cached `WasmFunc` does not keep a closed instance callable.

Call `Runtime.Close` from a callback that needs to initiate shutdown. Waiting there with `CloseContext` or `WaitClosed` can wait for the callback itself. Do the waiting from your application's shutdown path after stopping incoming requests.

If `CloseContext` reaches its deadline, shutdown continues. Keep track of the runtime and use `WaitClosed` later to observe the final outcome; a timeout is not proof that every callback has stopped.
