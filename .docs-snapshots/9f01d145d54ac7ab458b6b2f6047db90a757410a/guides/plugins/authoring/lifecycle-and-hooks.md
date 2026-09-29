---
description: Start and stop plugin state at the correct boundary, then add scoped runtime observers or interceptors.
---

# Lifecycle and hooks

`Register` builds a plan. It should decode configuration and declare contributions, without starting work that must later be undone.

## Add lifecycle callbacks

Keep the registration small:

```go
return reg.Lifecycle(wago.PluginLifecycle{
	Start: p.start,
	Stop:  p.stop,
})
```

Both callbacks receive a `context.Context` and return an error.

`Start` runs after Wago accepts the full plugin plan. Start listeners, files, and goroutines there.

`Stop` also runs after a partially failed `Start`. Check which resources exist, stop accepting work, wake blocked callbacks, and release each resource once.

See [examples/09-plugin-config-lifecycle](https://github.com/wago-org/wago/tree/main/examples/09-plugin-config-lifecycle) for a runnable lifecycle.

## Choose a hook

Use `RuntimeCloseObserver` when runtime shutdown matters. Module work belongs in `ModuleSourceTransformer`, `ModuleCompileObserver`, or `ModuleCloseObserver`. Their Authorities are `runtime.close.observe`, `module.source.transform`, `module.compile.observe`, and `module.close.observe`.

For instances, an interceptor can reject work or attach state; an observer records the result. Use `InstanceInstantiateInterceptor` or `InstanceInstantiateObserver` while creating an instance, and `InstanceInvokeInterceptor` or `InstanceInvokeObserver` around calls. `InstanceCloseObserver` handles exact-instance close.

Request only the matching Authority: `instance.instantiate.intercept`, `instance.instantiate.observe`, `instance.invoke.intercept`, `instance.invoke.observe`, or `instance.close.observe`.

## Observe a call

Get the observer during registration:

```go
calls, err := reg.InstanceInvokeObserver()
if err != nil {
	return err
}
```

Attach the callback:

```go
return calls.After(func(event wago.InvocationEvent) {
	log.Printf("%s: %v", event.Export, event.Err)
})
```

Observers record outcomes. Interceptors may return an error to stop an operation. Use opaque event identities to correlate state instead of retaining a `Runtime`, `Module`, or `Instance`.

Run [examples/10-hooks](https://github.com/wago-org/wago/tree/main/examples/10-hooks) to see the complete compile, instantiate, invoke, close, and runtime-close order.
