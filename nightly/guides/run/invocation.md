---
description: Select a WebAssembly export, pass typed CLI arguments, and choose the Wago core feature set.
---

# Invoke a WebAssembly export

Use the `fib.wasm` from [Getting started](/getting-started). It exports an ordinary function, so select it with `--invoke` or `-e`:

```sh
wago run --invoke fib fib.wasm 30
```

Wago decodes and validates the module, compiles it to native code, creates an instance, calls the export, and prints the result.

## Typed arguments

Arguments are decoded from the export's Wasm signature. Plain values usually do what you mean:

```sh
wago run --invoke fib fib.wasm 30
```

Add a suffix when you want the type to be explicit:

```sh
wago run --invoke fib fib.wasm 30:i32
```

The scalar suffixes are `i32`, `i64`, `f32`, and `f64`. Wago checks the argument count and every type before entering guest code.

::: tip Put runtime flags before the module
Everything after the module path belongs to the exported function. This lets a guest receive an argument such as `--verbose` without Wago claiming it.
:::

## Core feature sets

Wago defaults to the WebAssembly Core 2 compatibility set. Opt into the complete supported Core 3 set when the module needs it:

```sh
wago run --core 3 --invoke fib fib.wasm 20
```

Unsupported or disabled features fail during decoding or validation. Wago does not quietly skip instructions or malformed structured sections.

## Command modules

If your module exports `_start`, omit `--invoke`. Wago passes the remaining arguments to the guest. A host exit becomes the process exit code; other traps are reported as runtime failures.
