---
description: Diagnose Wago module decoding, validation, imports, exports, arguments, and WebAssembly feature sets.
---

# Fix module, import, export, and call errors

Separate decoding, validation, linking, and invocation. The first boundary that fails tells you where to look next.

## Decode or validation failure

Separate validation from execution:

```sh
wago validate fib.wasm
```

Common causes are malformed bytes, a disabled proposal, a module built for a different WebAssembly feature profile, or a feature unavailable on the selected platform. Wago enables its supported Core 3 feature set by default.

Select Core 2 compatibility when the producer or deployment requires that narrower profile:

```sh
wago run --core 2 --invoke fib fib.wasm 20
```

Do not use feature flags to force malformed Wasm through.

## Missing import

```sh
wago module imports fib.wasm
wago module capabilities fib.wasm
```

An unresolved import means the module needs another plugin scope, an uninstalled plugin, an application host function, or a corrected name and signature.

For a local project:

```sh
wago init --run
wago add github.com/wago-org/wasi
wago plugin list
```

For the Go API:

```go
imports := wago.NewImports()
imports.HostFunc("host", "log", logFunc)

instance, err := runtime.Instantiate(ctx, module, wago.WithImports(imports))
```

## Missing export

Command modules normally export `_start`. Select a library function explicitly:

```sh
wago run --invoke missing fib.wasm 20
```

A source-language function name does not necessarily survive compilation as a Wasm export.

## Rejected arguments

Wago follows the Wasm signature. This fails before guest code because `nope` is not an `i32`:

```sh
wago run --invoke fib fib.wasm nope
```

Use a value that matches the signature:

```sh
wago run --invoke fib fib.wasm 30:i32
```

In Go, match the declared signature with slot helpers (`wago.I32`, `wago.I64`, `wago.F32`, `wago.F64`). The typed API can also report a type mismatch before running the guest:

```go
out, err := inst.InvokeValues(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
```


## A Go embedder never starts the program

The CLI chooses an export for you. `Runtime.Instantiate` only runs a WebAssembly start section if one exists; it does not select `_start`, `main`, or `_initialize`. Invoke the entry point the guest toolchain documents. TinyGo reactor guests in the embedding tutorial export `_initialize`, which must run once per instance before your own exports.

A guest that uses WASI also needs those imports. A successful `Compile` checks the module, but it does not install a WASI provider or grant filesystem access.

## A raw result changes after another call

`Invoke`, `InvokeContext`, and `WasmFunc.Invoke` return instance-owned result slots. Copy a result slice before the next invocation if you need to keep it. `InvokeValues` returns an independently owned typed slice, but is deprecated in favor of the raw APIs for normal invocation; use it deliberately when its typed checks or Runtime invoke hooks are needed.
