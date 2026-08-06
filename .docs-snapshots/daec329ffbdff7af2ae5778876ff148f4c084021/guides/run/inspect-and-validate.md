---
description: Inspect WebAssembly imports and capabilities, then validate a module without executing it.
---

# Inspect imports and validate modules

A Wasm module has no ambient access to files, clocks, or a network. Those capabilities arrive through imports supplied by the host or a plugin.

## List imports

```sh
wago module imports fib.wasm
```

The output shows each exact import and whether the selected plugin scope resolves it. Add `--json` for a script or CI check:

```sh
wago module imports fib.wasm --json
```

## List required capabilities

```sh
wago module capabilities fib.wasm
```

This turns low-level imports into higher-level authority such as filesystem or network access. Review those requirements before adding a plugin.

<Accordion title="Every import is unresolved">

The module probably needs a plugin or application-supplied host functions. A WASI command module commonly starts with:

```sh
wago init --run
wago add wago-org/wasi
```

Read [Use plugins](/guides/plugins) before granting access to host resources.

</Accordion>

<Accordion title="The plugin is installed but imports stay unresolved">

Check the selected scope:

```sh
wago plugin list --local
wago plugin list --global
wago status
```

Then run with `--local`, `--global`, or an explicit `--plugin` selection.

</Accordion>

## Validate without running

```sh
wago validate fib.wasm
```

A successful validation is quiet. Validation does not instantiate the module, call its start function, or exercise host imports.

For a large module, opt into parallel validation:

```sh
wago validate --parallel fib.wasm
wago validate --parallel=4 fib.wasm
```

With no worker count, Wago chooses adaptively. A number sets the worker maximum.
