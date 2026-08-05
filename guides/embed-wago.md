---
description: Compile WebAssembly, create instances, call exports, and manage guest state with Wago's Go API.
---

# Embed Wago in Go

Install the package:

```sh
go get github.com/wago-org/wago
```

The high-level API keeps compilation, instances, plugins, typed calls, and cleanup under one `Runtime`.

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

## The whole lifecycle

<Steps>
  <Step title="Create a runtime">

```go
rt := wago.NewRuntime()
defer rt.Close()
```

  </Step>
  <Step title="Compile and instantiate">

```go
mod, err := rt.Compile(wasmBytes)
inst, err := rt.Instantiate(ctx, mod)
defer inst.Close()
```

  </Step>
  <Step title="Call an export">

```go
out, err := inst.Call(ctx, "add", wago.ValueI32(20), wago.ValueI32(22))
fmt.Println(out[0].I32()) // 42
```

  </Step>
</Steps>

## Quick answers

<Accordion title="Can instances share compiled code?" open>

Yes. Compile one `Module`, then instantiate it as many times as needed. Each instance gets its own globals, tables, and memory. See [Runtime and modules](/guides/embed/runtime-and-modules).

</Accordion>

<Accordion title="Can I call one instance from several goroutines?">

An individual instance has a non-concurrent call contract. Use separate instances for simultaneous guest execution. See [Calls and guest state](/guides/embed/calls-and-state).

</Accordion>

<Accordion title="Where do host functions go?">

Pass application-specific imports with `wago.WithImports`. Register reusable host APIs as plugins. See [Imports and artifacts](/guides/embed/imports-and-artifacts) and [Host functions](/guides/host-functions).

</Accordion>
