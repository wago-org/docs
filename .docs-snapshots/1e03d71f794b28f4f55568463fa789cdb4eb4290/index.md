---
description: A wonderfully quick, compact, and extensible WebAssembly runtime for Go
---

# Welcome to Wago

Glad you're here!

## Pick your way in

<CardGroup>
  <Card title="Run a Wasm file" href="/getting-started" icon="fa-play">
    Install Wago, choose a runtime, and run a real module before moving on to the full CLI guide.
  </Card>
  <Card title="Embed Wago in Go" href="/guides/embed-wago" icon="fa-code">
    Keep a runtime in your process, reuse compiled modules, and create isolated guest instances.
  </Card>
  <Card title="Connect Wasm to Go" href="/guides/host-functions" icon="fa-right-left">
    Bind reflection-free host functions and exchange values through checked guest memory.
  </Card>
  <Card title="Extend Wago with plugins" href="/guides/plugins" icon="fa-plug">
    Add WASI, host capabilities, compiler hooks, or custom WebAssembly features through the plugin system.
  </Card>
</CardGroup>

## What is Wago?

Wago is a wonderfully quick, compact, and extensible WebAssembly runtime for Go.

Originally, we designed it with microcontrollers in mind. We figured that if it could run well on a tiny system, it could run even better on a conventional, more powerful one.

A quote has stuck with me throughout the project:

> “Fast hardware should bring excellence, not reason to waste it.”

We built Wago around that idea. It pushed us to cut overhead, memory use, and bloat instead of hiding them behind faster hardware. Our goal is to make Wago as fast and capable as possible without ever letting it grow wasteful.

We wanted the community to shape Wago too. Its plugin system lets users supply imports, control code generation, and even add custom WebAssembly features. Plugins can take Wago in new directions without forcing every new idea into the core runtime.

## What's in the box?

We wanted Wago to be wonderful to use, so we've actually added quite a bit.

- **Runtime and compiler**: execute Wasm, save precompiled `.wago` files, or build standalone executables for AMD64 and ARM64.
- **Plugins**: extend the runtime with literally anything. Host capabilities, compiler hooks, and custom WebAssembly features all fit here.
- **Manager**: install, swap, and update Wago runtimes across nightly, canary, or a specific commit.
- **Registry**: discover and publish extensions at [plugins.wago.sh](https://plugins.wago.sh).
- **Go API**: compile once, create isolated instances, call typed exports, access guest state, and honor cancellation inside your own process.
