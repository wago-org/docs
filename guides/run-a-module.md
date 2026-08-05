---
description: Run, inspect, validate, precompile, and package WebAssembly modules with the Wago CLI.
---

# Run a module

`wago run` turns a Wasm file into a native function call:

```sh
wago run math.wasm 20 22
```

`run` is the default command, so `wago math.wasm 20 22` does the same thing.

## Pick a topic

<CardGroup>
  <Card title="Invoke an export" href="/guides/run/invocation" icon="fa-play">
    Choose a function, pass typed arguments, and opt into Core 3.
  </Card>
  <Card title="Inspect and validate" href="/guides/run/inspect-and-validate" icon="fa-code">
    Find imports, capabilities, and validation failures before execution.
  </Card>
  <Card title="Develop and tune" href="/guides/run/development" icon="fa-right-left">
    Use watch mode, parallel compilation, and measured compiler overrides.
  </Card>
  <Card title="Build artifacts" href="/guides/run/artifacts" icon="fa-code">
    Choose between portable Wasm, `.wago`, and standalone executables.
  </Card>
</CardGroup>

## Quick answers

<Accordion title="How do I call a named function?" open>

```sh
wago run --invoke add math.wasm 20 22
```

Wago reads the function signature and checks every argument. See [Invoke an export](/guides/run/invocation).

</Accordion>

<Accordion title="How do I find missing host support?">

```sh
wago module imports app.wasm
wago module capabilities app.wasm
```

The first command lists exact imports. The second summarizes the host authority the module needs. See [Inspect and validate](/guides/run/inspect-and-validate).

</Accordion>

<Accordion title="How do I rerun after a rebuild?">

```sh
wago run --watch app.wasm
```

Wago polls every `200ms` by default and starts with fresh module state each time. See [Develop and tune](/guides/run/development).

</Accordion>

<Accordion title="Should I build .wago or an executable?">

Use `.wago` when you control the Wago runtime and want to skip compilation. Use `wago compile` when the result must run without Wago installed. Keep `.wasm` as the portable source either way. See [Build artifacts](/guides/run/artifacts).

</Accordion>

## Everyday loop

```sh
wago module imports app.wasm
wago validate app.wasm
wago run --watch app.wasm
wago build app.wasm -o app.wago
```

Add a plugin only when the import inspection shows that the module needs one.
