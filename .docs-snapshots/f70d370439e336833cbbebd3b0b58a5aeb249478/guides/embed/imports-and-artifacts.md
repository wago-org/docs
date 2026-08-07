---
description: Supply host imports, attach precompiled Wago code to a runtime, and close runtime resources correctly.
---

# Supply imports and load artifacts

This is the seam for application-owned host behavior, precompiled code caches, and explicit runtime cleanup.

```sh
go run github.com/wago-org/wago/examples/16-serialize@latest
```

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
