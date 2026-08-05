---
description: A wonderfully quick, compact, and extensible WebAssembly runtime for Go
---

# Welcome to Wago

Glad you're here!

## What is Wago?

Wago is a wonderfully quick, compact, and extensible WebAssembly runtime for Go.

Originally, we designed it with microcontrollers in mind. We figured that if it could run well on a tiny system, it could run even better on a conventional, more powerful one.

A quote has stuck with me throughout the project:

> “Fast hardware should bring excellence, not reason to waste it.”

We built Wago around that idea. It pushed us to cut overhead, memory use, and bloat instead of hiding them behind faster hardware. Our goal is to make Wago as fast and capable as possible without ever letting it grow wasteful.

We wanted the community to shape Wago too. Its plugin system lets users supply imports, control code generation, and even add custom WebAssembly features. Plugins can take Wago in new directions without forcing every new idea into the core runtime.

## What's in the Box?

We wanted Wago to be wonderful to use, so we've actually added quite a bit.

- **Runtime**: execute wasm binaries quickly, compile to exectuables, and more.
- **Plugins**: extend the runtime with literally anything. Has a website like NPM to boot.
- **Manager**: included version manager. Install, swap, and update wago easily.
- **Registry**: publish your plugins to the Wago Plugin Registry.
- **Go API**: an exceptionally powerful API for integrating with Go code.

## Design Goals

We want Wago to be well balanced, which means that we value:

**Performance**

We want to be as performant as possible. Most runtimes use a multi-pass compiler and do a lot of fancy stuff, but that uses a lot of memory and time: two things we don't have. Instead, we built a very efficient singlepass compiler based on the Valent-Block architecture that attains similar performance to conventional compilers, but with much less overhead.

**Low Memory**

As said before, one of our goals was to run on microcontrollers. This means that we cannot have runaway allocations and memory-churn. Instead, we keep things in-registers as often as possible and choose the most memory-efficient ways of representing critical data. This also helps performance because I/O is such a bottleneck for performance-critical software.

**Extendibility**

I mean, need I say more? Want a http server? *Install it.* Really want support for AVX? *Add it!* Want GPU bindings? *Write them!*

Anything that limits itself to just a runtime will stay just that. We want to open it up not just for contributors on GitHub, but to *everyone* who uses wago. It's mutually beneficial!

> We also ban anything with quadratic compute or memory growth. This means it's *very* hard to DoS a wago instance.

## What do you want to build?

<CardGroup>
  <Card title="Run a Wasm file" href="/getting-started" icon="fa-play">
    Install Wago, choose a runtime, and run a real module in a few minutes.
  </Card>
  <Card title="Embed Wago in Go" href="/guides/embed-wago" icon="fa-code">
    Compile a module once, create an instance, and call an export with typed values.
  </Card>
  <Card title="Connect Wasm to your host" href="/guides/host-functions" icon="fa-right-left">
    Let guest code call Go functions and safely exchange data through linear memory.
  </Card>
  <Card title="Add capabilities with plugins" href="/guides/plugins" icon="fa-plug">
    Add WASI and other integrations without hiding permissions or resolved versions.
  </Card>
</CardGroup>
