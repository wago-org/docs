---
description: Add Wago plugins to local or global scope and select them for run, build, and compile commands.
---

# Install plugins and choose a scope

Install plugins locally for one project or globally for your machine, then choose which scope `run`, `build`, and `compile` should use.

## Add a plugin

```sh
wago init --run
wago add wago-org/wasi
```

`wago add` is the short form of `wago plugin add`. Wago resolves the package, asks you to review its capabilities, writes project state, and rebuilds the selected runtime.

## Local scope

Local plugins belong to the nearest `wago.json`:

```sh
wago plugin add --local wago-org/wasi
```

Use local scope for applications and repositories. The dependency and authority travel with the project.

## Global scope

Global plugins are shared across your user account:

```sh
wago plugin add --global wago-org/wasi
```

This works well for personal tools used across unrelated directories.

## Select a scope at run time

```sh
wago run --local --invoke fib fib.wasm 20
wago run --global --invoke fib fib.wasm 20
wago run --bare --invoke fib fib.wasm 20
```

- `--local` uses the project plugin set.
- `--global` uses the shared user-wide set.
- `--bare` uses neither.
- `--plugin name,other` adds plugins for one command.

If a plugin becomes part of the application, add it to `wago.json` instead of leaving it in shell history.

## Inspect the selection

```sh
wago status
wago plugin list
wago plugin inspect wago-org/wasi
```
