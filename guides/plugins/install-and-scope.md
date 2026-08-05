---
description: Add Wago plugins to local or global scope and select them for run, build, and compile commands.
---

# Install and choose scope

## Add a plugin

```sh
wago init --run
wago add wago-org/wasi
```

`wago add` is the short form of `wago plugin add`. Wago resolves the package, asks you to review its capabilities, writes project state, and rebuilds the selected runtime.

Add several plugins together:

```sh
wago add wago-org/wasi wago-org/workers
```

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
wago run --local app.wasm
wago run --global app.wasm
wago run --bare app.wasm
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

## Next

- [Review grants and lockfiles](/guides/plugins/grants-and-lockfiles)
- [Inspect module imports](/guides/run/inspect-and-validate)
- [Return to Use plugins](/guides/plugins)
