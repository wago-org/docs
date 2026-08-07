---
description: Choose between portable Wasm, Wago precompiled modules, and standalone native executables.
---

# Build `.wago` files and executables

Wago can keep the original Wasm, serialize native compilation, or package the runtime and module together.

| Output | Command | Portable | Needs Wago installed |
|---|---|---|---|
| `.wasm` | your Wasm toolchain | Across supported runtimes | Yes |
| `.wago` | `wago build` | No, host-specific | Yes |
| Native executable | `wago compile` | One target per build | No |

## Precompile to `.wago`

```sh
wago build fib.wasm -o fib.wago
wago run fib.wago 20
```

This moves compilation out of the run path.

::: warning Keep the original Wasm
A `.wago` file is tied to its host architecture and Wago's compiled format. Rebuild it after an incompatible Wago update and for every architecture you support.
:::

## Build a standalone executable

```sh
wago compile fib.wasm --invoke fib -o fib
./fib 20
```

Cross-compile to a supported target:

```sh
wago compile fib.wasm --invoke fib --target linux/arm64 -o fib-linux-arm64
```

Wago supports Darwin, Linux, and Windows on AMD64 and ARM64. Core features, plugins, parallelism, and compiler settings are fixed at build time.

## Select plugin scope

```sh
wago build --local fib.wasm -o fib.wago
wago compile --global fib.wasm --invoke fib -o fib-global
wago compile --bare fib.wasm --invoke fib -o fib-bare
```

- `--local` uses the nearest `wago.json`.
- `--global` uses the user-wide plugin set.
- `--bare` disables both sets.
- `--plugin name,other` adds plugins for this command.

Preview standalone work before changing anything:

```sh
wago compile fib.wasm --invoke fib --dry-run --json
```
