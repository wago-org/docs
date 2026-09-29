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

In Go, use matching typed values:

```go
out, err := inst.InvokeValues(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
```
