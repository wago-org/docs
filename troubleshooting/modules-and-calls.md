---
description: Diagnose Wago module decoding, validation, imports, exports, arguments, and WebAssembly feature sets.
---

# Modules and calls

## Decode or validation failure

Separate validation from execution:

```sh
wago validate module.wasm
```

Common causes are malformed bytes, a disabled proposal, a module built for Core 3 while Wago uses the Core 2 default, or a feature unavailable on the selected platform.

Try Core 3 only when the producer intentionally emits it:

```sh
wago run --core 3 module.wasm
```

Do not use feature flags to force malformed Wasm through.

## Missing import

```sh
wago module imports module.wasm
wago module capabilities module.wasm
```

An unresolved import means the module needs another plugin scope, an uninstalled plugin, an application host function, or a corrected name and signature.

For a local project:

```sh
wago init --run
wago add <plugin>
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
wago run --invoke add math.wasm 20 22
```

A source-language function name does not necessarily survive compilation as a Wasm export.

## Rejected arguments

Wago follows the Wasm signature. Add explicit scalar suffixes where needed:

```sh
wago run --invoke convert math.wasm 42:i64 3.5:f64
```

In Go, use matching typed values:

```go
out, err := inst.Call(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
```

## Next

- [Inspect and validate modules](/guides/run/inspect-and-validate)
- [Troubleshoot plugin resolution](/troubleshooting/plugins-and-builds)
- [Return to Troubleshooting](/troubleshooting)
