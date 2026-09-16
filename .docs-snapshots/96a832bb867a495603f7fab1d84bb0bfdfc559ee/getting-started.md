---
description: Install Wago, select a runtime, and run a real WebAssembly module from a clean terminal.
---

# Getting started

This guide takes you from an empty machine to a successful WebAssembly call. You will install the Wago version manager, select a runtime, download a tiny module, and run it.

![Installing Wago and selecting a canary runtime](/demos/install.gif)

## Install the manager

::: code-group

```bash [Go Install]
go run github.com/wago-org/wago/cli/wago-installer@latest
```

```bash [macOS / Linux]
curl -fsSL https://install.wago.sh/unix | sh
```

```powershell [PowerShell]
irm https://install.wago.sh/ps | iex
```

:::

```sh
wago --version
```

You can think of the wago command as a **version manager**. It handles version installing, upgrading, and switching. In order to run wasm, you need to install the actual runtime.

If you only need Wago as a library in an existing Go project, add the package directly:

```sh
go get github.com/wago-org/wago
```

## Install a runtime

```sh
wago version install
```

## Download a small module

![Downloading, inspecting, and running the Fibonacci module](/demos/run-fib.gif)

```sh
curl -fsSL https://wago.sh/corpora/fib.wasm -o fib.wasm
```

This module exports a function named `fib`. It takes one `i32` argument and returns the corresponding Fibonacci number.

You can inspect its exports before running it:

```sh
wago module exports fib.wasm
```

The module exports a `fib (i32) -> i32` function. Without `--invoke`, Wago selects `_start`, then `main`, then the module's only exported function—in this case, `fib`. If several exported functions remain, name one with `--invoke` or `-e`.

## Run it

In this case, `fib` is the only exported function, so Wago selects it automatically:

```sh
wago fib.wasm 30
```

You should see:

```text
832040
```

## Try the everyday commands

> Wago uses either [Go 1.22 or newer](https://go.dev/) or [TinyGo 0.41.1](https://tinygo.org/getting-started/install/), the tested TinyGo baseline, to link standalone executables. Make sure one of them is available on `PATH`.

Create a standalone executable:

::: code-group

```bash [macOS / Linux]
wago compile fib.wasm -o fib
./fib 30
```

```powershell [PowerShell]
wago compile fib.wasm -o fib.exe
.\fib.exe 30
```

```cmd [Command Prompt]
wago compile fib.wasm -o fib.exe
fib.exe 30
```

:::

## Where to go next

<CardGroup>
  <Card title="Use the CLI well" href="./guides/cli" icon="→">
    Pick exports, pass typed arguments, watch files, inspect imports, and precompile modules.
  </Card>
  <Card title="Embed Wago in Go" href="./guides/embed/runtime-and-modules" icon="◇">
    Move from a shell command to a long-lived runtime inside your application.
  </Card>
  <Card title="Add host capabilities" href="./using-plugins" icon="✦">
    Install the WASI plugin, review its requested access, and run a module that uses it.
  </Card>
  <Card title="Fix a first-run problem" href="./troubleshooting" icon="?">
    Diagnose PATH, runtime selection, imports, exports, and stale precompiled files.
  </Card>
</CardGroup>
