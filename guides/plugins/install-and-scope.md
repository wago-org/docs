---
description: Create a local Wago project and add its first plugin interactively.
---

# Add a plugin

You need an active Wago runtime and Go 1.22 or newer. Complete [Getting started](../../getting-started) first if `wago status` does not show a runtime.

Start in the directory that contains your `module.wasm`. Initialize a local project:

```sh
wago init
```

Select **Run WebAssembly**. Wago creates `wago.json` in the current directory.

Inspect the module before choosing a plugin:

```sh
wago module imports module.wasm
```

Find a package that provides those imports at [plugins.wago.sh](https://plugins.wago.sh), then add it. For a module that imports Wide's `as-simd` functions:

```sh
wago add JairusSW/wide
```

Review the source and requested access in the interactive security screen, then confirm the build. Wago leaves the old project state in place if resolution or compilation fails.

The nearest `wago.json` makes this a local install. Local plugins travel with the project and are the right default for repositories you share or deploy. Global plugins are intended for personal tools used across unrelated directories.

Confirm that the plugin was built:

```sh
wago plugins list
```

## Choose the scope deliberately

From a project directory, `wago add` uses its nearest `wago.json`. You can make the choice explicit:

```sh
wago add --local wago-org/wasi/p1
```

For a personal runtime shared by unrelated directories:

```sh
wago add --global wago-org/wasi/p1
```

A project's local graph takes precedence over the global graph. They are not merged. Select the runtime you want for one invocation:

```sh
wago run --local module.wasm
wago run --global module.wasm
wago run --bare module.wasm
```

`--bare` selects no plugins. It is useful for checking that a module only needs core WebAssembly. It will not satisfy WASI or other host imports.

## Select a provider and version

A package can contain several providers. For example, the WASI root offers a choice between the bundle and individual previews. An explicit provider path skips that picker:

```sh
wago add wago-org/wasi/p1
```

To constrain updates, quote the complete package spec:

```sh
wago add 'wago-org/wasi/p1@^0.3.1'
```

The manifest keeps the range; the lockfile keeps the selected release. In non-interactive use, a root package selects its whole bundle. Choose a provider path when you only need that provider.

Next, [review exactly what Wago installed](./grants-and-lockfiles).
