---
description: Compile a WebAssembly module, create an isolated instance, and call an export from Go.
---

# Run WebAssembly from Go

Start here when Wago should live inside your Go process. You will build the same guest in WAT, AssemblyScript, or TinyGo, then compile it, create an instance, and call its `add` export from Go.

## Create a small project

You need Go 1.22 or newer and one guest compiler: [WABT](https://github.com/WebAssembly/wabt), [AssemblyScript](https://www.assemblyscript.org/getting-started.html), or [TinyGo](https://tinygo.org/getting-started/install/).

```sh
mkdir wago-embed
cd wago-embed
go mod init example.com/wago-embed
go get github.com/wago-org/wago@main
mkdir guest
```

Pick a guest language. Each version exports the same WebAssembly function.

<Tabs sync="embed-guest-language">
  <Tab title="WAT">

Create `guest/add.wat`:

```wat
(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))
```

Build it:

```sh
wat2wasm guest/add.wat -o module.wasm
```

  </Tab>
  <Tab title="AssemblyScript">

Create `guest/add.ts`:

```ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

Build it with a pinned compiler:

```sh
npx --yes --package assemblyscript@0.28.8 asc \
  guest/add.ts --runtime stub --optimize --noAssert \
  --outFile module.wasm
```

  </Tab>
  <Tab title="TinyGo">

Create `guest/main.go`:

```go
//go:build tinygo

package main

//go:wasmexport add
func add(a, b int32) int32 { return a + b }

func main() {}
```

Build it:

```sh
tinygo build -target=wasm-unknown -no-debug \
  -o module.wasm ./guest
```

  </Tab>
</Tabs>

Create `main.go`:

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
	wasm, err := os.ReadFile("module.wasm")
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

	// TinyGo reactors initialize their runtime through this export. WAT and
	// AssemblyScript modules in this example do not emit it.
	if slices.Contains(module.Exports(), "_initialize") {
		if _, err := instance.InvokeValues(ctx, "_initialize"); err != nil {
			return err
		}
	}

	results, err := instance.InvokeValues(
		ctx,
		"add",
		wago.ValueI32(20),
		wago.ValueI32(22),
	)
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

Run it:

```sh
go run .
```

```text
42
```

The guest language changes how you produce `module.wasm`, not how you embed it. The Go side sees the same WebAssembly types and export name in every case. TinyGo's `_initialize` export is the one lifecycle difference in this example; call it once per new instance before calling your own exports.

## Know what you own

`Runtime` owns shared compiler resources, plugins, and lifecycle state. `Module` holds validated native code that can be reused. `Instance` owns mutable guest state such as memory, tables, and globals.

Create the runtime and compile the module once. Create instances according to the lifetime of the guest state you need, and close all three resources when you are finished.

From here, choose the part your application needs:

- [Calls and state](./calls-and-state) for values, memory, globals, and instance lifetime.
- [Host functions](./host-functions) when Wasm needs to call your Go code.
- [Limits and cancellation](./limits-and-policy) before running untrusted modules.
- [Concurrency and shutdown](./services-and-concurrency) for a long-lived service.
- [Precompiled artifacts](./artifacts) when startup compilation is too expensive.
