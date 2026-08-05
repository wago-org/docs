---
description: Install Wago, select a runtime, and run a real WebAssembly module from a clean terminal.
---

# Getting started

This guide takes you from an empty machine to a successful WebAssembly call. You will install the Wago version manager, select a runtime, download a tiny module, and run it.

![Installing Wago and selecting a canary runtime](/demos/install.gif)

## 1. Install the manager

<Tabs sync="install-os">
  <Tab title="macOS / Linux">

```sh
curl -fsSL https://install.wago.sh/unix | sh
```

  </Tab>
  <Tab title="Windows">

In PowerShell:

```powershell
irm https://install.wago.sh/ps | iex
```

In Command Prompt:

```cmd
curl -fsSL https://install.wago.sh/cmd | cmd
```

  </Tab>
</Tabs>

The bootstrap downloads a checksummed installer for your platform, then walks you through the destination and `PATH` setup. Go is only needed if Wago cannot download a release manager and has to build one from source.

Open a new terminal if the installer changed your `PATH`, then make sure the manager is ready:

```sh
wago --version
```

The manager handles versions and projects. It intentionally does not bundle a runtime.

If you only need Wago as a library in an existing Go project, add the package without installing the CLI:

```sh
go get github.com/wago-org/wago
```

## 2. Install a runtime

```sh
wago version install
```

## 3. Download a small module

![Downloading, inspecting, and running the Fibonacci module](/demos/run-fib.gif)

```sh
curl -fsSL \
  https://wago.sh/corpora/fib.wasm \
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
