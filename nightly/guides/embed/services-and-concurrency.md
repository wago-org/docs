---
description: Compile once, create isolated instances for concurrent requests, and shut a long-lived Wago runtime down cleanly.
---

# Use Wago in a long-lived service

Create one runtime at service startup and compile each module once. Instances hold mutable guest state, so choose their lifetime around that state.

## Compile during startup

```go
rt := wago.NewRuntime(wago.WithRuntimeConfig(cfg))

mod, err := rt.Compile(wasmBytes)
if err != nil {
	return err
}
```

Keep both values on your service. Loading plugins and compiling on every request adds work and makes failures arrive after the service has started accepting traffic.

## Give concurrent calls separate instances

```go
inst, err := rt.Instantiate(ctx, mod)
if err != nil {
	return err
}
defer inst.Close()

return call(ctx, inst)
```

One instance accepts one call at a time. Separate instances can run concurrently while sharing the module's compiled code.

Create a fresh instance per request when guest state should not survive. Keep an instance on one worker when globals or memory should persist. If several goroutines share that state, serialize access in your service.

## Keep request authority narrow

Pass request-specific imports with `wago.WithImport`, and apply a `wago.Policy` to every instance. Do not store request credentials in runtime-wide plugin state.

Use the request context for both `Instantiate` and `Call`. A canceled request should stop waiting even if the service remains healthy.

## Wait for shutdown

`Runtime.Close()` starts shutdown and may finish asynchronously when plugins or active work are involved. At the service boundary, wait for the final result:

```go
shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

if err := rt.CloseContext(shutdown); err != nil {
	return err
}
```

Stop admitting requests first. Let active calls return, close persistent instances and modules, then close the runtime. [examples/06-runtime-service](https://github.com/wago-org/wago/tree/main/examples/06-runtime-service) contains the complete small service.
