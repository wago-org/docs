---
description: Build a small Go program that embeds Wago, compiles a module, creates an instance, and calls a typed export.
---

# Embed Wago in Go

We will build a Go program that loads `fib.wasm` and prints the thirtieth Fibonacci number. The same runtime shape works inside a server, worker, or desktop application.

## 1. Create a Go module

```sh
mkdir wago-embed
cd wago-embed
go mod init example.com/wago-embed
go get github.com/wago-org/wago
```

Wago is a Go library, so it does not compile Rust, TinyGo, AssemblyScript, or C source. Compile guest source with its own toolchain and give Wago the resulting `.wasm` file.

For this tutorial, download a ready-made module:

```sh
curl -fsSL \
  https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm \
  -o fib.wasm
```

## 2. Create the host program

Create `main.go`:

```go
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/wago-org/wago"
)

func main() {
	wasm, err := os.ReadFile("fib.wasm")
	if err != nil {
		panic(err)
	}

	rt := wago.NewRuntime()
	defer rt.Close()

	mod, err := rt.Compile(wasm)
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	inst, err := rt.Instantiate(ctx, mod)
	if err != nil {
		panic(err)
	}
	defer inst.Close()

	out, err := inst.Call(ctx, "fib", wago.ValueI32(30))
	if err != nil {
		panic(err)
	}

	fmt.Println(out[0].I32())
}
```

## 3. Run it

```sh
go run .
```

You should see:

```text
832040
```

The program did four pieces of work:

1. `NewRuntime` created the application-level runtime.
2. `Compile` decoded, validated, and compiled the module.
3. `Instantiate` created one isolated set of guest state.
4. `Call` checked the argument against the export signature and invoked `fib`.

A missing export, wrong value type, guest trap, or cancelled context comes back as an error.

## 4. Inspect the boundary

Add these lines after `Compile`:

```go
fmt.Println("exports:", mod.Exports())
fmt.Println("imports:", mod.Imports())
fmt.Println("capabilities:", mod.RequiredCapabilities())
```

Run the program again. `fib.wasm` reports an export and no host requirements. In an application that accepts third-party modules, inspect this boundary before instantiation and decide what the guest may access.

## 5. Reuse compiled code

The useful lifetime usually looks like this:

```text
process or service
└── Runtime
    ├── compiled Module
    ├── Instance for request A
    └── Instance for request B
```

Create one runtime for a meaningful application boundary. Compile a module once, then instantiate it more than once when callers need isolated memories, tables, or globals.

Always close each instance. A direct instance remains caller-owned even when the runtime owns the compiler and plugin resources around it.

::: warning Keep compiled input alive
After a successful `Compile`, do not modify the input byte slice while the compiled module is alive. Wago may retain views into that storage to avoid copying the whole module.
:::

## 6. Put a deadline on guest work

Use the request or job context you already have:

```go
ctx, cancel := context.WithTimeout(context.Background(), 250*time.Millisecond)
defer cancel()

out, err := inst.Call(ctx, "work", wago.ValueI64(1))
```

Add `time` to the import block when you try this. Cancellation interrupts running Wasm and returns an error. Close the instance according to your application's lifecycle instead of assuming cancellation disposed it.

## When the low-level API fits better

The package-level `Compile`, `Instantiate`, and `Invoke` functions use raw 64-bit call slots:

```go
compiled, err := wago.Compile(nil, wasm)
inst, err := wago.Instantiate(compiled, wago.InstantiateOptions{})
out, err := inst.Invoke("add", wago.I32(2), wago.I32(40))
fmt.Println(wago.AsI32(out[0]))
```

Use this for a small embedding that does not need runtime plugins or lifecycle hooks. Start with `Runtime` and typed `Value` calls for applications expected to grow.

Continue with [Host functions and guest memory](/guides/host-functions) when the module needs to call back into Go. The repository also has a [runnable typed-runtime example](https://github.com/wago-org/wago/tree/main/examples/02-runtime-typed).
