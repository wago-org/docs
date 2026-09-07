---
description: Add Wago plugins to local or global scope and select them for run, build, and compile commands.
---

# Install plugins and choose a scope

Install plugins locally for one project or globally for your machine, then choose which scope `run`, `build`, and `compile` should use.

## Add a plugin

```sh
wago init --run
wago add github.com/wago-org/wasi
```

`wago add` is the short form of `wago plugin add`. Wago resolves direct and
transitive packages, verifies typed Contract providers, and presents one review
of exact sources, scoped Authorities, and bindings. It stages the download,
provider catalog, generated runtime, and complete dry-run plan before atomically
replacing project state. A failure leaves the previous runtime usable.

## Local scope

Local plugins belong to the nearest `wago.json`:

```sh
wago plugin add --local github.com/wago-org/wasi
```

Use local scope for applications and repositories. The dependency and authority travel with the project.

## Global scope

Global plugins are shared across your user account:

```sh
wago plugin add --global github.com/wago-org/wasi
```

This works well for personal tools used across unrelated directories.

## Select a scope at run time

<Tabs sync="plugin-scope">
  <Tab title="Project">

```sh
wago run --local --invoke fib fib.wasm 20
```

Uses the nearest project's plugin set.

  </Tab>
  <Tab title="Global">

```sh
wago run --global --invoke fib fib.wasm 20
```

Uses the shared user-wide set.

  </Tab>
  <Tab title="Bare">

```sh
wago run --bare --invoke fib fib.wasm 20
```

Uses no plugins.

  </Tab>
</Tabs>

Add plugins to `wago.json` before running so resolution, Authorities, and
Contract bindings remain reviewable and reproducible.

## Inspect the selection

```sh
wago plugin tree
```

`tree` shows why every transitive plugin was selected. To read one definition and its grants:

```sh
wago plugin inspect github.com/wago-org/wasi
```

Inspection does not start plugin code.
