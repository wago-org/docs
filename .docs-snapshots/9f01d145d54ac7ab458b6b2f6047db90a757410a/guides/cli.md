---
description: Invoke, inspect, develop, debug, and precompile WebAssembly modules with the Wago CLI.
---

# Use the CLI

[Getting started](../getting-started) covers installation, running a module, and compiling an executable. This page contains the module operations that go beyond that path.

## Invoke an export

Select a function and pass its arguments after the module path:

```sh
wago run --invoke fib fib.wasm 30
```

Use `30:i32`, `30:i64`, `30:f32`, or `30:f64` when the type must be explicit. Put Wago flags before the module path.

## Inspect and validate

Inspect a module without executing it:

```sh
wago module imports fib.wasm
wago module exports fib.wasm
wago module capabilities fib.wasm
wago validate fib.wasm
```

Add `--json` when another program needs the output.

## Develop

Rerun when the module changes or parallelize work on a large module:

```sh
wago run --watch --invoke fib fib.wasm 20
wago run --parallel=4 --invoke fib fib.wasm 20
```

Parallelism adds overhead to small modules. Measure before keeping it enabled.

## Debug a trap

Reproduce the exact export and arguments outside watch mode. If validation passes, Wago reports the trap reason and any Wasm frames:

```sh
wago run --invoke process module.wasm 42
```

`context.Canceled` and `context.DeadlineExceeded` are host cancellation, not guest traps.

## Cache native code

Build a host-specific `.wago` artifact when startup compilation matters:

```sh
wago build fib.wasm -o fib.wago
wago run --allow-native-artifact fib.wago 20
```

A `.wago` file contains native code. Run only artifacts you trust, retain the original Wasm, and rebuild for each architecture or incompatible Wago release.
