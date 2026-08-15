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

```sh
wago --version
```

You can think of the wago command as a **version manager**. It handles version installing, upgrading, and switching. In order to run wasm, you need to install the actual runtime.

If you only need Wago as a library in an existing Go project, add the package directly:

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
curl -fsSL https://wago.sh/corpora/fib.wasm -o fib.wasm
```

This module exports a function named `fib`. It takes one `i32` argument and returns the corresponding Fibonacci number.

You can inspect its exports before running it:

```sh
wago module exports fib.wasm
```

The module exports a `fib (i32) -> i32` function. Without `--invoke`, Wago selects `_start`, then `main`, then the module's only exported function. If several exported functions remain, name one with `--invoke` or `-e`.

## 4. Run it

In this case, `fib` is the only exported function, so Wago selects it automatically:

```sh
wago fib.wasm 30
```

You should see:

```text
fib(30) = 832040
```

## 5. Try the everyday commands

Create a standalone executable:

```sh
wago compile --invoke fib fib.wasm
```

Standalone executables default to `_start`, so `--invoke fib` bakes the library-style function into this one.

<Tabs sync="run-os">
  <Tab title="macOS / Linux">

```sh
./fib 30
```

  </Tab>
  <Tab title="PowerShell">

```powershell
.\fib 30
```

  </Tab>
  <Tab title="Command Prompt">

```cmd
fib 30
```

  </Tab>
</Tabs>

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
