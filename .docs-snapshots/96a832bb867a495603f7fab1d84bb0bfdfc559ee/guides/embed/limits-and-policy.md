---
description: Bound compilation and instance resources, apply guest policy, and cancel WebAssembly calls.
---

# Add limits and cancellation

There are three separate boundaries:

- `RuntimeConfig` controls compilation and runtime-wide resource ceilings.
- `Policy` checks one module when an instance is created.
- `context.Context` controls how long instantiation and calls may continue.

## Run with explicit boundaries

Use the `fib.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/wago-org/wago"
)

func run() error {
	wasm, err := os.ReadFile("fib.wasm")
	if err != nil {
		return err
	}

	config := wago.NewRuntimeConfig().
		WithMaxModuleBytes(16<<20).
		WithMemoryLimitPages(256).
		WithMaxFunctionLocals(4096).
		WithInstanceLimits(8, 0)
	if err := config.Validate(); err != nil {
		return err
	}

	runtime := wago.NewRuntime(wago.WithRuntimeConfig(config))
	defer runtime.Close()
	module, err := runtime.Compile(wasm)
	if err != nil {
		return err
	}
	defer module.Close()

	policy := wago.Policy{
		MaxMemories:     1,
		MaxTableEntries: 1024,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	instance, err := runtime.Instantiate(ctx, module, wago.WithPolicy(policy))
	if err != nil {
		return err
	}
	defer instance.Close()

	results, err := instance.InvokeValues(ctx, "fib", wago.ValueI32(20))
	if err != nil {
		return err
	}
	fmt.Println(results[0].I32())
	return nil
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
```

```sh
go run .
```

```text
6765
```

`WithMaxModuleBytes` rejects oversized input before compilation. `WithMemoryLimitPages` caps the live size of each linear memory. `WithInstanceLimits` bounds simultaneously live direct instances; a closed instance returns its admission budget.

`Policy` is an admission check against the module's declared capabilities and limits. The zero policy is permissive. A non-empty `AllowedCapabilities` list is exclusive, and `DeniedCapabilities` always wins. A `MaxMemoryBytes` policy also requires the module to declare a finite maximum.

## Handle cancellation and failures

`Call` returns `context.Canceled` or `context.DeadlineExceeded` when its context interrupts guest execution:

```go
if errors.Is(err, context.DeadlineExceeded) {
	return fmt.Errorf("guest exceeded its deadline: %w", err)
}
```

Policy failures wrap `wago.ErrPermissionDenied`. Runtime traps can be inspected without matching error text:

```go
var trap *wago.TrapError
if errors.As(err, &trap) {
	log.Printf("guest trapped: %s", trap.Code)
}
```

A context can interrupt Wasm execution, but it cannot forcibly make arbitrary Go code return. Host functions that may block should accept a bounded dependency or cooperate with cancellation. Truly hostile blocking code needs process isolation.
