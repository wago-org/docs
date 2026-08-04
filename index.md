---
description: A wonderfully quick, compact, and extensible WebAssembly runtime for Go
---

# Wago documentation

A wonderfully quick, compact, and extensible WebAssembly runtime for Go

Wago compiles Wasm to native code, runs without cgo, and can be used from the command line or embedded in a Go program.

If you are new here, you do not need to understand the compiler or plugin system yet. Pick the path that matches what you are trying to do and get something working first.

## What do you want to build?

<CardGroup>
  <Card title="Run a Wasm file" href="/getting-started" icon="→">
    Install Wago, choose a runtime, and run a real module in a few minutes.
  </Card>
  <Card title="Embed Wago in Go" href="/guides/embed-wago" icon="◇">
    Compile a module once, create an instance, and call an export with typed values.
  </Card>
  <Card title="Connect Wasm to your host" href="/guides/host-functions" icon="↔">
    Let guest code call Go functions and safely exchange data through linear memory.
  </Card>
  <Card title="Add capabilities with plugins" href="/guides/plugins" icon="✦">
    Add WASI and other integrations without hiding permissions or resolved versions.
  </Card>
</CardGroup>

## The two pieces you install

Wago separates management from execution:

- The **manager** is the small `wago` command installed by `install.sh`. It installs versions, switches runtimes, manages plugins, and keeps projects reproducible.
- A **runtime** is the version and build that actually compiles and executes WebAssembly. You choose one after installing the manager.

That is why a fresh installation may ask you to select a runtime the first time you run a module. Nothing is broken; Wago is asking which release channel and build you want.

## A useful first ten minutes

<Steps>
  <Step title="Run one module">

Follow [Getting started](/getting-started) and make sure `fib(30) = 832040` appears in your terminal.

  </Step>
  <Step title="Inspect what it needs">

Use `wago module imports` before adding plugins or host functions. A Wasm module's imports are its contract with the host.

  </Step>
  <Step title="Choose how Wago fits">

Keep using the [command line](/guides/run-a-module), or move into the [Go API](/guides/embed-wago) when your application needs instances, host functions, cancellation, or custom policy.

  </Step>
</Steps>

## Where Wago fits

Wago runs `.wasm` modules and its own precompiled `.wago` artifacts. It does not compile Rust, TinyGo, AssemblyScript, or C source into WebAssembly; use that language's Wasm toolchain first, then give the resulting module to Wago.

Wago is JIT-only. It is designed for native execution, low host-call overhead, and a small operational footprint. If a module depends on host APIs such as WASI, files, clocks, or networking, those capabilities must be supplied explicitly through host functions or plugins.

## Keep going

<CardGroup>
  <Card title="Understand release channels" href="/guides/version-channels" icon="⌁">
    Pick canary, nightly, or a pinned release, then choose a profile and build.
  </Card>
  <Card title="Troubleshoot a problem" href="/troubleshooting" icon="?">
    Work through the errors new users are most likely to meet.
  </Card>
  <Card title="Browse plugins" href="https://plugins.wago.sh/" icon="✦">
    Find open-source integrations published for the Wago plugin ecosystem.
  </Card>
  <Card title="Read the source" href="https://github.com/wago-org/wago" icon="↗">
    Explore runnable examples, feature support, and the engine itself.
  </Card>
</CardGroup>
