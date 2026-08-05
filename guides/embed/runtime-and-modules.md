---
description: Create a Wago runtime, compile modules once, instantiate isolated state, and configure compilation.
---

# Runtime and modules

## Create the runtime

```go
rt := wago.NewRuntime()
defer rt.Close()
```

`Runtime` owns compiler configuration, registered plugins, host imports, lifecycle hooks, and the compatible reference store.

## Compile Wasm

```go
wasmBytes, err := os.ReadFile("math.wasm")
if err != nil {
	return err
}

mod, err := rt.Compile(wasmBytes)
if err != nil {
	return err
}
```

Compilation decodes and validates the bytes under the runtime's configured feature set, then produces native code.

## Instantiate isolated state

```go
first, err := rt.Instantiate(ctx, mod)
if err != nil {
	return err
}
defer first.Close()

second, err := rt.Instantiate(ctx, mod)
if err != nil {
	return err
}
defer second.Close()
```

The two instances share compiled code. Each has separate globals, tables, and linear memory.

An individual instance has a non-concurrent call contract. Use separate instances when several goroutines need to execute guest code simultaneously.

## Configure compilation

```go
cfg := wago.NewRuntimeConfig().
	WithCoreFeatures(wago.CoreFeaturesV3).
	WithMemoryLimitPages(256).
	WithFunctionWorkers(0)

if err := cfg.Validate(); err != nil {
	return err
}

rt := wago.NewRuntime(wago.WithRuntimeConfig(cfg))
defer rt.Close()
```

Core 2 compatibility is the default. Core 3 is explicit. Worker value `0` selects adaptive work, `1` forces serial work, and larger values set a maximum bounded by `GOMAXPROCS` and module size.

## Apply instance policy

Compiler settings belong to `RuntimeConfig`. Guest authority and resource limits belong to an instance:

```go
policy := wago.Policy{
	DeniedCapabilities: []wago.Capability{"net.outbound"},
	MaxMemoryBytes:     64 << 20,
	MaxTableEntries:    4096,
}

inst, err := rt.Instantiate(ctx, mod, wago.WithPolicy(policy))
```

The zero policy is permissive. A non-empty allow-list becomes exclusive, explicit denies win, and declared resource limits are checked before execution.

## Next

- [Call exports and access guest state](/guides/embed/calls-and-state)
- [Configure Wago from Go](/reference/configuration/automation-and-go)
- [Return to Embed Wago](/guides/embed-wago)
