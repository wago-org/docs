---
description: Install Wago, select a runtime, and run a real WebAssembly module from a clean terminal.
---

# Getting started

This guide takes you from an empty machine to a successful WebAssembly call. You will install the Wago version manager, select a runtime, download a tiny module, and run it.

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

The installer prints where it put `wago`. Open a new terminal if it updated your
`PATH`, then check that your shell can find it:

```sh
wago --version
```

The manager can download a prebuilt binary or build from source when one is not
available. Have [Go 1.22 or newer](https://go.dev/dl/) on `PATH` for that fallback,
plugin builds, and standalone executables. You can run a prebuilt core runtime
without a Go toolchain.

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

This page is the current development guide. Use the version selector when you
need docs for an installed release. [Configuration and versions](./guides/cli/configuration)
explains profiles, channels, and pinning an exact revision.

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
