---
description: Choose between portable Wasm, Wago precompiled modules, and standalone native executables.
---

# Build artifacts

Wago can keep the original Wasm, serialize native compilation, or package the runtime and module together.

| Output | Command | Portable | Needs Wago installed |
|---|---|---|---|
| `.wasm` | your Wasm toolchain | Across supported runtimes | Yes |
| `.wago` | `wago build` | No, host-specific | Yes |
| Native executable | `wago compile` | One target per build | No |

## Precompile to `.wago`

```sh
wago build app.wasm -o app.wago
wago run app.wago
```

This moves compilation out of the run path.

::: warning Keep the original Wasm
A `.wago` file is tied to its host architecture and Wago's compiled format. Rebuild it after an incompatible Wago update and for every architecture you support.
:::

## Build a standalone executable

```sh
wago compile app.wasm -o app
./app
```

The module must export `_start` unless you bake in another function:

```sh
wago compile math.wasm --invoke add -o add
./add 20 22
```

Cross-compile to a supported target:

```sh
wago compile app.wasm --target linux/arm64 -o app-linux-arm64
```

Wago supports Darwin, Linux, and Windows on AMD64 and ARM64. Core features, plugins, parallelism, and compiler settings are fixed at build time.

## Select plugin scope

```sh
wago build --local app.wasm
wago compile --global app.wasm -o app
wago compile --bare app.wasm -o app
```

- `--local` uses the nearest `wago.json`.
- `--global` uses the user-wide plugin set.
- `--bare` disables both sets.
- `--plugin name,other` adds plugins for this command.

Preview standalone work before changing anything:

```sh
wago compile app.wasm --dry-run --json
```

## Next

- [Understand plugin scopes](/guides/plugins/install-and-scope)
- [Pin runtimes for repeatable builds](/guides/versions/updates-and-automation)
- [Return to Run a module](/guides/run-a-module)
