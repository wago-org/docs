---
description: Pass typed values, choose an instance lifetime, and access guest memory and globals.
---

# Work with calls and state

Continue in the project from [Run WebAssembly from Go](./runtime-and-modules). The short call snippets below fit inside that program; the counter example later on replaces `main.go`. Its guest needs WABT's `wat2wasm`, even if you used another language for the first guest.

For normal calls, use `InvokeContext` when you have a request context, or `Invoke` when you do not need cancellation. Both use raw `uint64` ABI slots:

| Wasm type | Encode an argument | Read a result |
|---|---|---|
| `i32` | `wago.I32(v)` | `wago.AsI32(slot)` |
| `i64` | `wago.I64(v)` | `wago.AsI64(slot)` |
| `f32` | `wago.F32(v)` | `wago.AsF32(slot)` |
| `f64` | `wago.F64(v)` | `wago.AsF64(slot)` |

Encode the type the export actually declares. Casting a Go float to `uint64` does not preserve its WebAssembly bit representation. If you also have the [Wago CLI installed](../../getting-started), inspect a module with `wago module exports module.wasm` when the signature is unclear.

Raw results belong to the instance and remain valid only until its next invocation. Read or copy them before another call, including a call through a resolved `WasmFunc`:

```go
out, err := instance.InvokeContext(ctx, "add", wago.I32(20), wago.I32(22))
if err != nil {
	return err
}
saved := append([]uint64(nil), out...)
fmt.Println(wago.AsI32(saved[0]))
```

## Choose typed checks when you need them

`InvokeValues(ctx, name, args...)` remains available, but is deprecated in the current API in favor of `Invoke` and `InvokeContext`. It is useful when you specifically need type checking, independently owned result slices, or Runtime invocation hooks. The raw APIs do not run those typed invocation hooks.

```go
out, err := instance.InvokeValues(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
if err != nil {
	return err
}
fmt.Println(out[0].I32())
```

Use `ValueI64`, `ValueF32`, and `ValueF64` with the matching result accessor for the other scalar types. Supplying `ValueF64(20)` to an `i32` parameter is rejected before the guest executes. A `v128` is not a typed `Value`; the raw API uses two adjacent little-endian `uint64` slots for it. Non-null reference slots are store-owned tokens, not Go pointers or portable numeric IDs.

## See instance state survive

Create `counter.wat`:

```wat
(module
  (global $count (export "count") (mut i32) (i32.const 0))
  (func (export "inc") (result i32)
    global.get $count
    i32.const 1
    i32.add
    global.set $count
    global.get $count))
```

Compile it with [WABT](https://github.com/WebAssembly/wabt):

```sh
wat2wasm counter.wat -o counter.wasm
```

Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/wago-org/wago"
)

func run(ctx context.Context) error {
	wasm, err := os.ReadFile("counter.wasm")
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

	instance, err := runtime.Instantiate(ctx, module)
	if err != nil {
		return err
	}
	defer instance.Close()

	for range 3 {
		results, err := instance.InvokeContext(ctx, "inc")
		if err != nil {
			return err
		}
		fmt.Println(wago.AsI32(results[0]))
	}

	count, err := instance.GlobalValue("count")
	if err != nil {
		return err
	}
	fmt.Println("count:", count.I32())

	if err := instance.SetGlobalValue("count", wago.ValueI32(40)); err != nil {
		return err
	}
	results, err := instance.InvokeContext(ctx, "inc")
	if err != nil {
		return err
	}
	fmt.Println("after set:", wago.AsI32(results[0]))

	fresh, err := runtime.Instantiate(ctx, module)
	if err != nil {
		return err
	}
	defer fresh.Close()
	results, err = fresh.InvokeContext(ctx, "inc")
	if err != nil {
		return err
	}
	fmt.Println("fresh instance:", wago.AsI32(results[0]))
	return nil
}

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatal(err)
	}
}
```

```sh
go run .
```

```text
1
2
3
count: 3
after set: 41
fresh instance: 1
```

One instance preserves state and serializes calls. This includes mutations made before a trap or cancellation: errors do not roll state back. A fresh instance starts with the module's initial state while reusing the same compiled code.

## Resolve a frequently used export

A `WasmFunc` resolves an export once. It still checks the instance lifecycle on every invocation, accepts arbitrary supported arity, and returns the same kind of borrowed result slice as `Invoke`:

```go
inc, err := instance.WasmFunc("inc")
if err != nil {
	return err
}
out, err := inc.Invoke()
if err != nil {
	return err
}
fmt.Println(wago.AsI32(out[0]))
```

This handle does not reserve the instance between calls. Use `InvokeContext` when each call needs a context, and close the instance when its state is no longer needed. After close, both named and resolved calls fail.

## Add guest memory

[Exchange bytes with a guest](./guest-memory) continues with a complete memory example. It checks guest pointer-length pairs, demonstrates that `Read` returns a copy, and shows that an out-of-bounds `Write` changes nothing.
