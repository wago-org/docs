---
description: Connect Wago plugins through typed, major-versioned Contracts.
---

# Contracts and dependencies

Use a Contract when one plugin needs a Go service from another.

## Name the service

Put the interface and Contract value in a small package both plugins import. The typed helpers are in `github.com/wago-org/wago/plugin`; alias that import as `pluginapi` so it does not collide with the scaffold's `type plugin`:

```go
import pluginapi "github.com/wago-org/wago/plugin"
```

```go
type Clock interface {
	UnixMillis() int64
}

var Contract = pluginapi.NewContract[Clock](
	"github.com/acme/wago-clock/service", 1,
)
```

Change the major when providers and consumers can no longer share the same Go interface.

## Provide it

List `Contract.Spec()` in `PluginDefinition.Provides`. During registration, provide the value:

```go
return pluginapi.Provide[Clock](reg, Contract, clock)
```

Use the explicit `[Clock]` type argument when `clock` has a concrete implementation type. Without it, Go can infer conflicting types from the Contract and value arguments.

## Require it

List the provider under `PluginDefinition.Requires` and a requirement under `Consumes`:

```go
Requires: []wago.PluginRequirement{{
    ID: "github.com/acme/wago-clock", Version: "^1.0.0",
}},
Consumes: []wago.ContractRequirement{{
    ID: Contract.ID(), Major: Contract.Major(), Mode: wago.ContractRequired,
}},
```

Then get the typed reference during `Register`:

```go
clock, err := pluginapi.Require(reg, Contract)
if err != nil {
    return err
}
```

Use the service inside `With` after registration has committed. For startup work, register a lifecycle callback; calling `With` immediately inside `Register` fails because the Contract is not active yet:

```go
return reg.Lifecycle(wago.PluginLifecycle{
    Start: func(context.Context) error {
        return clock.With(func(service Clock) error {
            fmt.Println(service.UnixMillis())
            return nil
        })
    },
})
```

This callback uses `context` and `fmt`. `With` keeps the provider alive until the callback returns. Do not retain `service` after it returns.

## Choose a binding

Use `pluginapi.Require` when exactly one provider must exist. Use `pluginapi.Optional` when the consumer can work without one. Use `pluginapi.Many` when it needs every selected provider in the reviewed order.

The lockfile records exact providers and ordering. Wago rejects missing providers, incompatible majors, duplicate single bindings, unreviewed bindings, and cycles before it calls a plugin factory.

Run [examples/13-plugin-contracts](https://github.com/wago-org/wago/tree/main/examples/13-plugin-contracts) for the complete two-plugin graph.

Run the published example without a source checkout:

```sh
go run github.com/wago-org/wago/examples/13-plugin-contracts@b084a7c9343f81a9120ca80a13d133884e88d514
```
