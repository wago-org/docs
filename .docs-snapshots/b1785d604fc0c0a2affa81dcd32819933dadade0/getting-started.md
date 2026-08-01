---
description: Install Wago, select a runtime, and run a real WebAssembly module from a clean terminal.
---

# Getting started

This guide takes you from an empty machine to a successful WebAssembly call. You will install the Wago manager, select a runtime, download a tiny module, and run it.

![Inspecting and running a small WebAssembly module with Wago](/demos/getting-started.gif)

::: tip What you need
The source installer requires Go 1.22 or newer. Git is preferred; if Git is unavailable, the installer can use a GitHub source archive with `curl` or `wget` and an archive extractor.
:::

## 1. Install the manager

```sh
curl -fsSL https://wago.sh/install.sh | sh
```

The installer asks where to put `wago`, normally `~/.wago/bin`, and can add that directory to your shell configuration.

Open a new terminal if the installer changed your `PATH`, then check the command:

```sh
wago --version
```

The manager handles versions and projects. It intentionally does not bundle a runtime.

## 2. Install a runtime

Nightly is a good place to begin while Wago is pre-release: it follows `main` on a daily cadence without changing after publication.

```sh
wago version install --nightly --use
```

`--use` makes the installed runtime active immediately. Without it, Wago asks whether you want to switch.

Other choices are covered in [Release channels and builds](/guides/version-channels). If you skip this step and run a module, Wago opens the same version picker for you.

## 3. Download a small module

```sh
curl -fsSL \
  https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm \
  -o fib.wasm
```

This module exports a function named `fib`. It takes one `i32` argument and returns the corresponding Fibonacci number.

You can inspect its host requirements before running it:

```sh
wago module imports fib.wasm
```

No imports means this module is self-contained. It does not need WASI, files, network access, or a custom host function.

## 4. Run it

```sh
wago run fib.wasm 30
```

You should see:

```text
fib(30) = 832040
```

Wago decoded and validated the module, compiled it to native code, created an instance, selected the exported function, converted `30` to the argument type from the Wasm signature, and printed the result.

`run` is the default command, so this is equivalent:

```sh
wago fib.wasm 30
```

## 5. Try the everyday commands

Validate without executing:

```sh
wago validate fib.wasm
```

A successful validation is quiet.

Precompile it for faster startup on the same host architecture:

```sh
wago build fib.wasm -o fib.wago
wago run fib.wago 30
```

Show the runtime, project, and plugin scope Wago selected:

```sh
wago status
```

::: warning Precompiled files are not portable releases
A `.wago` artifact is tied to its host architecture and Wago's compiled format. Keep the original `.wasm` and rebuild the artifact after an incompatible Wago upgrade.
:::

## Where to go next

<CardGroup>
  <Card title="Use the CLI well" href="/guides/run-a-module" icon="→">
    Pick exports, pass typed arguments, watch files, inspect imports, and precompile modules.
  </Card>
  <Card title="Embed Wago in Go" href="/guides/embed-wago" icon="◇">
    Move from a shell command to a long-lived runtime inside your application.
  </Card>
  <Card title="Add host capabilities" href="/guides/plugins" icon="✦">
    Understand when a module needs WASI, another plugin, or a host function of your own.
  </Card>
  <Card title="Fix a first-run problem" href="/troubleshooting" icon="?">
    Diagnose PATH, runtime selection, imports, exports, and stale precompiled files.
  </Card>
</CardGroup>
