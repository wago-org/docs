---
description: Supply host imports, attach precompiled Wago code to a runtime, and close runtime resources correctly.
---

# Imports and artifacts

## Supply application imports

```go
inst, err := rt.Instantiate(ctx, mod, wago.WithImports(wago.Imports{
	"host.log": logFunc,
}))
```

Import keys use `module.name`. Wago checks each value against the signature declared by the module.

Use `WithImports` for a small application-specific bridge. Register a plugin when several modules or applications need the same namespace, configuration, and lifecycle.

## Serialize compiled code

The low-level compiled form can be stored and loaded later:

```go
compiled, err := wago.Compile(nil, wasmBytes)
if err != nil {
	return err
}

blob, err := compiled.MarshalBinary()
if err != nil {
	return err
}

loaded, err := wago.Load(blob)
if err != nil {
	return err
}
```

Attach it to a high-level runtime:

```go
mod, err := rt.Module(loaded)
```

Serialized code is architecture- and format-specific. Retain the original Wasm and rebuild after incompatible Wago changes.

## Close what you own

Close direct instances before the runtime:

```go
if err := inst.Close(); err != nil {
	return err
}
if err := rt.Close(); err != nil {
	return err
}
```

`Close` is idempotent. Runtime close stops plugins and internal services, but direct instances remain caller-owned.

<Accordion title="Does Module need Close?">

The high-level `Module.Close` currently has no work to perform. Keep instance and runtime ownership explicit; those are the resources with meaningful lifecycle.

</Accordion>

<Accordion title="Can I load raw Wasm with wago.Load?">

Yes. `wago.Load` accepts raw Wasm or Wago's compiled binary form. Use `wago.IsCompiled` when a cache needs to distinguish them before loading.

</Accordion>

## Next

- [Implement host function signatures](/guides/host-functions/signatures)
- [Choose CLI artifacts](/guides/run/artifacts)
- [Browse runnable examples](https://github.com/wago-org/wago/tree/main/examples)
