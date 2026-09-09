---
description: Separate validation and linking failures from runtime traps, then inspect Wago trap codes and Wasm frames in Go.
---

# Debug a WebAssembly trap

A trap means the module started executing and hit a WebAssembly runtime error. Validation errors and missing imports happen earlier, so check those boundaries first.

## Reproduce the failing call

Run the same export with the same arguments outside watch mode:

```sh
wago run --invoke process module.wasm 42
```

Wago prints the trap reason and any recorded Wasm frame. The frame names the function and may include its bytecode offset. Keep that output with the module build that produced it.

## Check the module boundary

```sh
wago validate module.wasm
wago module imports module.wasm
wago module exports module.wasm
```

If validation or linking fails, fix that first. If the export signature differs from the source function, check what the guest compiler emitted.

## Inspect traps in Go

```go
var trap *wago.TrapError
if errors.As(err, &trap) {
	log.Printf("trap: %s", trap.Code)
	for _, frame := range trap.Frames {
		log.Printf("at %s", frame)
	}
}
```

Branch on a `TrapCode` only when your application can handle that case. For example, `wago.TrapLinMemOutOfBounds` identifies an invalid linear-memory access. Do not match the text returned by `Error()`.

Frames run from the trap site outward. Wago uses the module's function-name metadata when present and falls back to an export name or function index. A program counter is a Wasm bytecode offset, not a native address.

## Keep cancellation separate

`Instance.Call` returns `context.Canceled` or `context.DeadlineExceeded` when its context interrupted the guest. Check those errors before treating the failure as a guest bug:

```go
if errors.Is(err, context.DeadlineExceeded) {
	return retryLater
}
```

A repeatable division-by-zero, bad cast, null reference, or out-of-bounds access needs a guest fix. Retrying the same module, state, and arguments will repeat it.
