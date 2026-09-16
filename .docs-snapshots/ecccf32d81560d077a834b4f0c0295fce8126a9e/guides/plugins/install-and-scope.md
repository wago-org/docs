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

Next, [review exactly what Wago installed](./grants-and-lockfiles).
