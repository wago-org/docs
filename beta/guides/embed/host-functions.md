---
description: Bind Go functions as WebAssembly imports and safely exchange data through guest memory.
---

# Let Wasm call Go

A host function supplies an import declared by the guest. Start with an ordinary typed Go function; use the lower-level `HostFunc` form only when the callback needs the calling instance or its memory.

## Bind a typed function

The guest declares `host.mul(i32, i32) -> i32`, then uses it to implement `square`. Pick the language you want to embed.

<Tabs sync="embed-guest-language">
  <Tab title="WAT">

Create `guest/square.wat`:

```wat
(module
  (import "host" "mul" (func $mul (param i32 i32) (result i32)))
  (func (export "square") (param $value i32) (result i32)
    local.get $value
    local.get $value
    call $mul))
```

```sh
wat2wasm guest/square.wat -o square.wasm
```

  </Tab>
  <Tab title="AssemblyScript">

Create `guest/square.ts`:

```ts
@external("host", "mul")
declare function mul(a: i32, b: i32): i32;

export function square(value: i32): i32 {
  return mul(value, value);
}
```

```sh
npx --yes --package assemblyscript@0.28.8 asc \
  guest/square.ts --runtime stub --optimize --noAssert \
  --outFile square.wasm
```

  </Tab>
  <Tab title="TinyGo">

Create `guest/main.go`:

```go
//go:build tinygo

package main

//go:wasmimport host mul
func mul(a, b int32) int32

//go:wasmexport square
func square(value int32) int32 { return mul(value, value) }

func main() {}
```

```sh
tinygo build -target=wasm-unknown -no-debug \
  -o square.wasm ./guest
```

  </Tab>
</Tabs>

Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"slices"

	"github.com/wago-org/wago"
)

func run(ctx context.Context) error {
	wasm, err := os.ReadFile("square.wasm")
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

	instance, err := runtime.Instantiate(
		ctx,
		module,
		wago.WithImport("host", "mul", func(a, b int32) int32 {
			return a * b
		}),
	)
	if err != nil {
		return err
	}
	defer instance.Close()

	if slices.Contains(module.Exports(), "_initialize") {
		if _, err := instance.Call(ctx, "_initialize"); err != nil {
			return err
		}
	}

	results, err := instance.Call(ctx, "square", wago.ValueI32(9))
	if err != nil {
		return err
	}
	fmt.Println(results[0].I32())
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
81
```

`WithImport` keeps the Wasm module name and field name separate, so it remains unambiguous even when either contains a dot. Wago checks the Go function against the guest's declared signature during instantiation.

WAT spells the import directly, AssemblyScript uses `@external`, and TinyGo uses `//go:wasmimport`. All three produce the same WebAssembly boundary, so the host binding does not change.

## Read caller memory

Pointer-length pairs from a guest are untrusted. A `HostFunc` receives raw slots and a `HostModule` view of the active caller:

```go
write := wago.HostFunc(func(
	caller wago.HostModule,
	params []uint64,
	results []uint64,
) {
	ptr := uint32(params[0])
	length := uint32(params[1])
	memory := caller.Memory()

	end := uint64(ptr) + uint64(length)
	if end > uint64(len(memory)) {
		results[0] = wago.I32(-1)
		return
	}

	data := append([]byte(nil), memory[ptr:end]...)
	fmt.Printf("guest says %q\n", data)
	results[0] = wago.I32(int32(length))
})
```

Bind it the same way:

```go
wago.WithImport("env", "write", write)
```

Use a wider integer for `ptr + length` so the addition cannot wrap before the bounds check. The memory view and `HostModule` are valid only during the callback. Copy anything that must survive it, and do not send either value to another goroutine.

## Define failures deliberately

Wasm has no built-in Go `error` result. Prefer an explicit guest ABI such as a numeric status, a sentinel result, or an output buffer. When the callback cannot continue the current invocation, abort it with the original error:

```go
panic(wago.HostTrap{Err: err})
```

Wago recovers `HostTrap` at the native boundary and returns its error to the caller. An unexpected Go panic is a programming failure, not a guest error channel.

Host functions run as trusted Go in your process. Give each closure the narrowest interface it needs. Runtime policy limits declared guest capabilities and resources; it does not sandbox the Go callback itself.
