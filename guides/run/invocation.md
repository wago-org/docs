---
description: Select a WebAssembly export, pass typed CLI arguments, and choose the Wago core feature set.
---

# Invoke an export

For a command-style module, Wago uses `_start`. For a module that exports ordinary functions, select one with `--invoke` or `-e`:

```sh
wago run --invoke add math.wasm 20 22
```

Wago decodes and validates the module, compiles it to native code, creates an instance, calls the export, and prints the result.

## Typed arguments

Arguments are decoded from the export's Wasm signature. Plain values usually do what you mean:

```sh
wago run --invoke fib fib.wasm 30
```

Add a suffix when you want the type to be explicit:

```sh
wago run --invoke mix numbers.wasm 42 7:i64 3.5:f64
```

The scalar suffixes are `i32`, `i64`, `f32`, and `f64`. Wago checks the argument count and every type before entering guest code.

::: tip Put runtime flags before the module
Everything after the module path belongs to the exported function. This lets a guest receive an argument such as `--verbose` without Wago claiming it.
:::

## Core feature sets

Wago defaults to the WebAssembly Core 2 compatibility set. Opt into the complete supported Core 3 set when the module needs it:

```sh
wago run --core 3 generated.wasm
```

Unsupported or disabled features fail during decoding or validation. Wago does not quietly skip instructions or malformed structured sections.

## Command modules

If the module exports `_start`, run it without `--invoke`:

```sh
wago run app.wasm hello world
```

Wago exposes the arguments after the module to the guest. A host exit becomes the process exit code; other traps are reported as runtime failures.

## Next

- [Inspect imports and validate the module](/guides/run/inspect-and-validate)
- [Run in watch mode](/guides/run/development)
- [Return to Run a module](/guides/run-a-module)
