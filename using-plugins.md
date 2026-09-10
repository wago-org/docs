---
description: Install the WASI plugin, review its access, and run a WASI module with Wago.
---

# Using plugins

Wago keeps host capabilities outside the core runtime. Plugins add the capabilities a module needs without putting every integration into Wago itself.

In this guide, you will add WASI Preview 1 support to a local project and run a module that writes to standard output.

![Installing the WASI plugin and running a WASI module](/demos/wasi.gif)

## Before you begin

You need:

- Wago installed with a runtime selected. Complete [Getting started](/getting-started) first if `wago --version` does not show an active runtime.
- [Go 1.22 or newer](https://go.dev/doc/install). Wago plugins are Go modules compiled into your runtime.

Check both tools from your terminal:

```sh
wago --version
go version
```

## 1. Create a local Wago project

Create or enter a directory for the example, then initialize it:

```sh
mkdir wasi-example
cd wasi-example
wago init --run
```

This creates a `wago.json` manifest. Keeping the plugin local makes the project's dependencies and reviewed access reproducible instead of changing the runtime used by every project on your machine.

## 2. Add WASI

[WASI](https://wasi.dev/) defines system-style interfaces that WebAssembly modules can import. Wago provides those interfaces through the official [wago-org/wasi](https://plugins.wago.sh/wago-org/wasi) plugin:

```sh
wago add wago-org/wasi
```

Keep **Preview 1** selected for this example. Review the source, dependencies, and requested Authorities before accepting them. Plugins are native Go dependencies; grants control access to privileged Wago integration APIs, but they do not sandbox arbitrary plugin code.

Now, check to make sure it is installed:

```sh
wago plugins list
```

> A lot of the subcommands have aliases so that it reads naturally. For example, `wago plugin` and `wago plugins` both work the same way.

The command updates `wago.json`, writes the complete resolved graph and reviewed grants to `wago-lock.json`, and builds a project runtime. Commit both JSON files with your project.

## 3. Download a WASI module

This small module imports WASI Preview 1's `fd_write` function and calls it from `_start`:

```sh
curl -fsSL https://wago.sh/corpora/wasi-hello.wasm -o wasi-hello.wasm
```

You can see the import before executing the module:

```sh
wago module imports wasi-hello.wasm
```

## 4. Run it

```sh
wago run wasi-hello.wasm
```

You should see:

```text
hello from wasi
```

You can even compile it to a standalone executable:

::: code-group

```bash [macOS / Linux]
wago compile wasi-hello.wasm -o wasi-hello
./wasi-hello
```

```powershell [Windows]
wago compile wasi-hello.wasm -o wasi-hello.exe
.\wasi-hello.exe
```

:::

Wago finds the nearest `wago.json`, selects its project runtime, and uses the WASI plugin to satisfy the module's import.

## Where to go next

<CardGroup>
  <Card title="Install and choose scope" href="/guides/plugins/install-and-scope" icon="fa-plug">
    Learn when to use local, global, or bare plugin selection.
  </Card>
  <Card title="Review grants and lockfiles" href="/guides/plugins/grants-and-lockfiles" icon="fa-code">
    Understand Authorities, guest capabilities, dependency graphs, and reproducible builds.
  </Card>
  <Card title="Write your own plugin" href="/guides/plugins/authoring/first-plugin" icon="fa-right-left">
    Scaffold a Go module and add a host import from definition to catalog.
  </Card>
  <Card title="Browse plugins" href="https://plugins.wago.sh" icon="↗">
    Find published host capabilities and runtime extensions.
  </Card>
  <Card title="Troubleshoot a build" href="/troubleshooting/plugins-and-builds" icon="?">
    Fix missing Go tools, denied grants, stale lockfiles, and plugin build failures.
  </Card>
</CardGroup>
