---
description: Pass typed values, choose an instance lifetime, and access guest memory and globals.
---

# Work with calls and state

`Instance.Call` is the normal invocation API. It checks typed arguments against the export signature and uses the supplied context for cancellation.

| Wasm type | Go argument | Read a result |
|---|---|---|
| `i32` | `wago.ValueI32(v)` | `result.I32()` |
| `i64` | `wago.ValueI64(v)` | `result.I64()` |
| `f32` | `wago.ValueF32(v)` | `result.F32()` |
| `f64` | `wago.ValueF64(v)` | `result.F64()` |

Use the lower-level `Invoke` API only when you need raw ABI slots or `v128` values.

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
	if err != nil { return err }

	runtime := wago.NewRuntime()
	defer runtime.Close()
	module, err := runtime.Compile(wasm)
	if err != nil { return err }; defer module.Close()

	instance, err := runtime.Instantiate(ctx, module)
	if err != nil { return err }; defer instance.Close()

	for range 3 {
		results, err := instance.Call(ctx, "inc")
		if err != nil { return err }; fmt.Println(results[0].I32())
	}

	count, err := instance.GlobalValue("count")
	if err != nil { return err }
	fmt.Println("count:", count.I32())

	if err := instance.SetGlobalValue("count", wago.ValueI32(40)); err != nil { return err }
	results, err := instance.Call(ctx, "inc")
	if err != nil { return err }; fmt.Println("after set:", results[0].I32())

	fresh, err := runtime.Instantiate(ctx, module)
	if err != nil { return err }; defer fresh.Close()
	results, err = fresh.Call(ctx, "inc")
	if err != nil { return err }; fmt.Println("fresh instance:", results[0].I32())
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

One instance preserves state and accepts one call at a time. A fresh instance starts with the module's initial state while reusing the same compiled code.

## Read and write memory safely

Use checked copies for ordinary host access:

```go
data, ok := instance.Read(offset, length)
if !ok {
	return fmt.Errorf("guest memory range is out of bounds")
}

if ok := instance.Write(offset, replacement); !ok {
	return fmt.Errorf("guest memory range is out of bounds")
}
```

`Read` returns a copy. `Write` either copies the whole slice or changes nothing. Typed little-endian helpers such as `ReadUint32Le` and `WriteUint32Le` are available for scalar fields.

`instance.Memory().UnsafeBytes()` is a zero-copy mutable view. Use it only when you can keep the view inside a tightly controlled operation; never retain it after closing the instance.
