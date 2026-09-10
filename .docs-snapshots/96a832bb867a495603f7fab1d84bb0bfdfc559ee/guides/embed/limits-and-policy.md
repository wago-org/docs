---
description: Put compile, instance, memory, capability, and execution limits around guest WebAssembly.
---

# Run untrusted modules with limits

Treat module admission, instance admission, and execution time as separate boundaries. Set each one deliberately when users can supply Wasm.

## 1. Bound compilation

`RuntimeConfig` rejects oversized work before it becomes a live instance:

```go
cfg := wago.NewRuntimeConfig().
	WithMaxModuleBytes(16 << 20).
	WithMaxNativeCodeBytes(64 << 20).
	WithMaxFunctionLocals(4096).
	WithMemoryLimitPages(256)
```

`WithMemoryLimitPages` also applies to `memory.grow`. Use `WithInstanceLimits` when one runtime must cap its live instance count or aggregate declared memory.

Call `cfg.Validate()` before constructing the runtime. A zero limit usually removes that extra quota, so do not rely on zero as a safe default for tenant-supplied modules.

## 2. Limit one instance

Apply guest capabilities and declared resources at instantiation:

```go
policy := wago.Policy{
	AllowedCapabilities: []wago.Capability{"log.write"},
	MaxMemoryBytes:      16 << 20,
	MaxMemories:         1,
	MaxTableEntries:     1024,
}
```

```go
inst, err := rt.Instantiate(ctx, mod, wago.WithPolicy(policy))
```

A non-empty allow-list is exclusive, and explicit denies win. Memory policy checks the module's declared maximum. Require a finite maximum in guest modules when memory must fit a budget.

Policy limits only the guest. Any Go host function or plugin still has the authority of your process.

## 3. Put a deadline on calls

```go
ctx, cancel := context.WithTimeout(parent, 250*time.Millisecond)
defer cancel()

result, err := inst.Call(ctx, "work", wago.ValueI32(1000))
```

The call context interrupts guest execution. Host functions must pass that deadline to their own blocking file, network, or database work.

## 4. Handle rejections by kind

Use `errors.Is` instead of matching text. `wago.ErrResourceLimit` means a finite quota was exceeded. `wago.ErrPermissionDenied` covers policy and authority rejection. `wago.ErrUnsupported` means the Wasm is valid but the selected Wago build cannot execute it.

`rt.ResourceStats()` reports live instance and native-memory counters for limits enabled on that runtime. [examples/07-runtime-limits](https://github.com/wago-org/wago/tree/main/examples/07-runtime-limits) shows a one-instance quota being released and reused.
