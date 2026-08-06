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

Common causes are malformed bytes, a disabled proposal, a module built for Core 3 while Wago uses the Core 2 default, or a feature unavailable on the selected platform.

Try Core 3 only when the producer intentionally emits it:

```sh
wago run --core 3 --invoke fib fib.wasm 20
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
wago add wago-org/wasi
wago plugin list
```

For the Go API:

```go
wago.WithImports(wago.Imports{
	"host.log": logFunc,
})
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
out, err := inst.Call(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
```
