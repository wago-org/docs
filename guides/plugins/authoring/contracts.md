---
description: Connect Wago plugins through typed, major-versioned Contracts.
---

# Contracts and dependencies

Use a Contract when one plugin needs a Go service from another.

## 1. Name the service

Put the interface and Contract value in a small package both plugins import:

```go
type Clock interface {
	UnixMillis() int64
}

var Contract = plugin.NewContract[Clock](
	"github.com/acme/wago-clock/service", 1,
)
```

Change the major when providers and consumers can no longer share the same Go interface.

## 2. Provide it

List `Contract.Spec()` in `PluginDefinition.Provides`. During registration, provide the value:

```go
return plugin.Provide(reg, Contract, clock)
```

## 3. Require it

List the provider under `PluginDefinition.Requires` and the Contract under `Consumes`. Then get the typed reference:

```go
clock, err := plugin.Require(reg, Contract)
```

Use the service only inside `With`:

```go
return clock.With(func(service Clock) error {
	fmt.Println(service.UnixMillis())
	return nil
})
```

`With` keeps the provider alive until the callback returns. Do not retain `service` after it returns.

## Choose a binding

Use `plugin.Require` when exactly one provider must exist. Use `plugin.Optional` when the consumer can work without one. Use `plugin.Many` when it needs every selected provider in the reviewed order.

The lockfile records exact providers and ordering. Wago rejects missing providers, incompatible majors, duplicate single bindings, unreviewed bindings, and cycles before it calls a plugin factory.

Run [examples/13-plugin-contracts](https://github.com/wago-org/wago/tree/main/examples/13-plugin-contracts) for the complete two-plugin graph.
