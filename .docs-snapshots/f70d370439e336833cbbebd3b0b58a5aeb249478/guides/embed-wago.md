---
description: Compile WebAssembly, create instances, call exports, and manage guest state with Wago's Go API.
---

# Embed Wago in Go

Run the complete typed-runtime example from an empty directory:

```sh
go run github.com/wago-org/wago/examples/02-runtime-typed@latest
```

Inside your own Go module, add Wago with `go get github.com/wago-org/wago`. The high-level API keeps compilation, instances, plugins, typed calls, and cleanup under one `Runtime`.

## Pick a topic

<CardGroup>
  <Card title="Runtime and modules" href="/guides/embed/runtime-and-modules" icon="fa-code">
    Create a runtime, compile once, instantiate many times, and set compiler policy.
  </Card>
  <Card title="Calls and guest state" href="/guides/embed/calls-and-state" icon="fa-play">
    Call typed exports, cancel work, and access memory and globals.
  </Card>
  <Card title="Imports and artifacts" href="/guides/embed/imports-and-artifacts" icon="fa-right-left">
    Supply host functions, load precompiled code, and close what you own.
  </Card>
</CardGroup>
