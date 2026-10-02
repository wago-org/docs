---
description: Install Wago, select a runtime, and run a real WebAssembly module from a clean terminal.
---

# Getting started

This guide takes you from an empty machine to a successful WebAssembly call. You will install the Wago version manager, select a runtime, download a tiny module, and run it.

## Before you begin

Use a supported macOS, Linux, or Windows machine with network access and a writable home directory. The shell examples below use `curl` on macOS/Linux or PowerShell on Windows.

Install [Go 1.22 or newer](https://go.dev/dl/) and [Git](https://git-scm.com/downloads) before starting if you use the Go installer or need a source-build fallback. Released binaries do not always exist for the selected channel and platform. Go is also required for plugins and standalone executables; a downloaded prebuilt core runtime can run without it.

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

The installer prints where it put `wago`. If it updated your `PATH`, open a new terminal. If it instead asks you to add the default `~/.wago/bin` directory yourself, add it for the current shell:

::: code-group

```sh [macOS / Linux]
export PATH="$HOME/.wago/bin:$PATH"
```

```powershell [PowerShell]
$env:Path = "$HOME\.wago\bin;$env:Path"
```

:::

Use the actual directory printed by the installer if you chose another location. Add the same directory to your shell's startup configuration or Windows user `Path` to keep it for future terminals. Then check that your shell can find it:

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

The interactive picker lets you choose a channel and build. For a repeatable
first run without prompts, install the current beta's standard Go build:

```sh
wago version install --beta --profile standard --build normal --use --no-input
wago --version
```

The first core-module example below works with the beta runtime. These are the **canary development docs**; use the version selector for documentation matching a released runtime. The selector changes the pages you read, not the runtime installed on your machine.

[Configuration and versions](./guides/cli/configuration#pick-a-channel) shows how to switch to canary before trying development-only features. Go applications select their library version separately in `go.mod`; the embedding guides show that step explicitly.

## Download a small module

![Downloading, inspecting, and running the Fibonacci module](/demos/run-module.gif)

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

You need [Go 1.22 or newer](https://go.dev/) on `PATH` to build a standalone
executable. TinyGo builds need **both Go and TinyGo**; the smaller build is an
optional next step in [Standalone executables](./guides/cli/standalone).

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

The output includes its runtime. You can copy it to another machine with the
same operating system, architecture, and compatible CPU features and run it
without installing Wago.
Keep the original `.wasm` when you need to rebuild for a different target.

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
