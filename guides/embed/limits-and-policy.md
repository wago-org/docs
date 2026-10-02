---
description: Bound compilation and instance resources, apply guest policy, and cancel WebAssembly calls.
---

# Add limits and cancellation

There are three separate boundaries:

- `RuntimeConfig` controls compilation and runtime-wide resource ceilings.
- `Policy` checks one module when an instance is created.
- `context.Context` controls how long instantiation and calls may continue.

## Run with explicit boundaries

Use the `module.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"slices"
	"time"

	"github.com/wago-org/wago"
)

func run() error {
	wasm, err := os.ReadFile("module.wasm")
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

	if slices.Contains(module.Exports(), "_initialize") {
		if _, err := instance.InvokeContext(ctx, "_initialize"); err != nil {
			return err
		}
	}

	results, err := instance.InvokeContext(ctx, "add", wago.I32(20), wago.I32(22))
	if err != nil {
		return err
	}
	fmt.Println(wago.AsI32(results[0]))
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
42
```

`WithMaxModuleBytes` rejects oversized input before compilation. `WithMemoryLimitPages` caps the live size of each linear memory. `WithInstanceLimits` bounds simultaneously live direct instances; a closed instance returns its admission budget.

`Policy` is an admission check against the module's declared capabilities and limits. The zero policy is permissive. A non-empty `AllowedCapabilities` list is exclusive, and `DeniedCapabilities` always wins. A `MaxMemoryBytes` policy also requires the module to declare a finite maximum.

`Policy.MaxInvokeDuration` is retained for compatibility but is not enforced: a nonzero value is rejected with `wago.ErrUnsupported`. Use a context deadline for call duration.

## Handle cancellation and failures

`InvokeContext` and `InvokeValues` return `context.Canceled` or `context.DeadlineExceeded` when the supplied context interrupts guest execution:

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

## Interrupt a guest that does not return

A fast `add` call rarely reaches its deadline. This test needs WABT's `wat2wasm`, regardless of your earlier guest language. To check your actual cancellation path, create `guest/loop.wat`:

```wat
(module
  (func (export "spin")
    (loop $again
      br $again))
  (func (export "answer") (result i32)
    i32.const 42))
```

```sh
wat2wasm guest/loop.wat -o loop.wasm
```

Replace `main.go` with this complete program. Instantiation happens outside the short call deadline, so the timeout tests guest execution rather than setup:

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/wago-org/wago"
)

func run() error {
	wasm, err := os.ReadFile("loop.wasm")
	if err != nil {
		return err
	}
	runtime := wago.NewRuntime()
	defer runtime.Close()
	module, err := runtime.Compile(wasm)
	if err != nil {
		return err
	}
	defer module.Close()
	instance, err := runtime.Instantiate(context.Background(), module)
	if err != nil {
		return err
	}
	defer instance.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	_, err = instance.InvokeContext(ctx, "spin")
	if !errors.Is(err, context.DeadlineExceeded) {
		return fmt.Errorf("expected deadline exceeded, got %v", err)
	}
	fmt.Println("spin stopped at its deadline")

	out, err := instance.InvokeContext(context.Background(), "answer")
	if err != nil {
		return err
	}
	fmt.Println("next call:", wago.AsI32(out[0]))
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
spin stopped at its deadline
next call: 42
```

Cancellation does not roll back memory or globals, and it does not automatically close the instance. Use a new instance if your application needs a clean state after an interrupted call.

Native cancellation is supported on amd64 and arm64 with standard Go, or TinyGo with `-scheduler=threads`. Other TinyGo schedulers reject cancelable native calls before entering the guest. On Linux/amd64 with standard Go, interruption uses a thread-directed signal; other supported targets stop at native safepoints. Do not turn a deadline into a hard wall-clock guarantee for arbitrary host callbacks.

`Runtime.Compile` does not take a context. Apply compilation-size and resource limits before accepting untrusted modules, and account for compilation separately from invocation timeouts.
