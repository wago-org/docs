---
description: Run, inspect, validate, precompile, and package WebAssembly modules with the Wago CLI.
---

# Run a module

Use the `fib.wasm` downloaded in [Getting started](/getting-started):

```sh
wago run fib.wasm 20
```

`run` is the default command, so `wago fib.wasm 20` does the same thing.

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

## Everyday loop

```sh
wago module imports fib.wasm
wago validate fib.wasm
wago run --watch --invoke fib fib.wasm 20
wago build fib.wasm -o fib.wago
```

Add a plugin only when the import inspection shows that the module needs one.
