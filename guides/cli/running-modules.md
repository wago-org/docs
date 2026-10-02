---
description: Choose exports, pass typed arguments, inspect module metadata, rerun changed Wasm, and save trusted native artifacts.
---

# Run and inspect modules

You need an [installed Wago runtime](../../getting-started). Download the small Fibonacci module used below:

```sh
curl -fsSL https://wago.sh/corpora/fib.wasm -o fib.wasm
```

## Check the module first

```sh
wago validate fib.wasm
wago module exports fib.wasm
wago module imports fib.wasm
wago module capabilities fib.wasm
```

The exports include:

```text
exports:
  fib  func  (i32) -> i32
  memory  memory  min=0
```

`imports` shows each import and whether the selected runtime's plugins provide it. `capabilities` lists the capabilities associated with imports. These reports help identify missing host support; they do not grant access. See [using plugins](../../using-plugins) for that step.

`validate` checks the Wasm binary without running it. The inspection commands compile it to obtain metadata, but do not instantiate it or call its exports. Successful validation alone does not prove that the current runtime has every required feature or host import.

All four commands accept JSON output:

```sh
wago validate --json fib.wasm
wago module exports --json fib.wasm
wago module imports --json fib.wasm
wago module capabilities --json fib.wasm
```

Exports report functions, globals, tables, memories, and exception tags, with the fields relevant to each kind. Memory and table limits are Wasm limits; memory sizes are in pages.

## Call an export

```sh
wago run --invoke fib fib.wasm 30
```

```text
832040
```

`-e` is the short form of `--invoke`. If you omit it, Wago looks for `_start`, then `main`, then the sole exported function. Multiple remaining functions need an explicit choice. You can also omit `run`:

```sh
wago fib.wasm 30
```

Arguments use the function's declared parameter types. An explicit suffix controls how a value is encoded:

```sh
wago run --invoke fib fib.wasm 20:i32
```

The supported suffixes are `i32`, `i64`, `f32`, and `f64`. Match the declared type; a suffix is not a change to the Wasm signature. The CLI accepts numeric parameters and results. Use the [Go API](../embed/runtime-and-modules) for reference or `v128` values.

Keep Wago flags before the module path for readability. Flags can also follow the path. If a guest command needs an option with the same name as a Wago flag, put `--` before the guest arguments:

```sh
wago run command.wasm -- --help
```

This example assumes `command.wasm` is a command-style guest with `_start` and the required argument-supporting plugin. `fib.wasm` takes a function parameter instead.

## Call several exports on one instance

Repeat `--invoke` to call functions in order. Wago consumes arguments according to each function's arity:

```sh
wago run --invoke fib --invoke fib fib.wasm 20 30
```

```text
6765
832040
```

The calls share one instance, including its memory and globals. This is useful for an initialization export followed by a worker export. Values left over after the selected functions' parameters are not passed as extra function parameters.

## Rerun after a rebuild

On Linux and Windows, the standard runtime can watch a Wasm file:

```sh
wago run --watch --watch-interval 200ms --invoke fib fib.wasm 20
```

Rebuild the `.wasm` file in another terminal. Wago reruns when its contents change; it does not compile your guest-language source. Press Ctrl+C to stop. Watch flags are currently absent on macOS and lean builds. On Linux, launch through the `wago` manager; its process supervisor also needs procfs child lists. A restricted container that hides those lists cannot use watch mode.

## Adjust compilation and stack capacity

Use adaptive parallel validation and compilation for a large module, or set a worker maximum:

```sh
wago run -p --invoke fib fib.wasm 20
wago run --parallel=4 --invoke fib fib.wasm 20
```

Small modules may be slower with extra workers. Compare your actual workload before keeping the setting.

If a deeply recursive guest exhausts its native execution stack, increase its capacity:

```sh
wago run --native-stack 8MiB --invoke fib fib.wasm 20
```

The default is 4 MiB. Accepted capacities range from 512 KiB to 1 GiB and must be 16-byte aligned. The suffixes `B`, `KiB`, `MiB`, and `GiB` are case-sensitive. This controls the execution stack, not the guest's linear memory or WasmGC heap.

`--core 2` requests the strict Core 2 feature set; `--core 3` requests the complete Core 3 set on a supported target. The default chooses the best supported feature set. [Configuration](./configuration) covers compiler settings and their precedence.

## Save compiled code for later

```sh
wago build fib.wasm -o fib.wago
wago run --allow-native-artifact --invoke fib fib.wago 20
```

```text
6765
```

A `.wago` artifact contains native code. Enable `--allow-native-artifact` only for files you built or otherwise trust. It is an explicit trust decision, not a validator for downloaded machine code.

Keep the original `.wasm`: the CLI's validation and module-inspection commands read Wasm, not `.wago` artifacts. Rebuild artifacts for each target platform, after incompatible Wago upgrades, and when the compiler or plugin configuration changes. For a distributable program that does not need Wago installed, [build a standalone executable](./standalone).
