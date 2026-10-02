---
description: Diagnose Wago Go API host signatures, guest memory access, cancellation, and instance concurrency.
---

# Fix Go API and guest memory problems

Start at the host-to-Wasm boundary: import signatures, checked memory ranges, context cancellation, and instance ownership.

## Host import mismatch

Both the module name and field name must match the guest, including case. Create imports with `wago.NewImports()` and register callbacks with `imports.HostFunc(module, name, fn)`. Module and function names remain separate exact identities. Wago checks the callback and declared signature before guest startup.

Inspect the module first:

```sh
wago module imports fib.wasm
```

Then compare the parameter and result slots with the guest declaration. Typed callbacks infer their signatures. With `func(wago.HostCall)` or `func(wago.Caller, wago.HostCall)`, set `.Params(...)` and `.Results(...)` explicitly.

Build the whole collection before its first instantiation: imports are sealed on first use and cannot be modified afterward. If a later instance needs different bindings, create another collection.

## Guest memory range failure

Treat pointers as offsets. Validate addition in a wider integer:

```go
end := uint64(ptr) + uint64(length)
if end > uint64(len(memory)) {
	return fmt.Errorf("out of bounds")
}
data := memory[uint64(ptr):end]
```

Outside host callbacks, prefer checked instance helpers:

```go
data, ok := inst.Read(ptr, length)
if !ok {
	return fmt.Errorf("out of bounds")
}
```

`Caller.Memory()`, `HostCall`, and its raw slot views are valid only during that synchronous callback. Copy bytes that must survive it. [Exchange bytes with a guest](../guides/embed/guest-memory) is a complete example, including the pointer-overflow case.

Do not call the ordinary public invocation path synchronously from a callback on the active instance. Use `InvokeFromHost` with that callback's active `Caller`, otherwise the call can wait for itself.

## Cancellation does not stop work

Use a context-aware call:

```go
out, err := inst.InvokeContext(ctx, "work", slots...)
```

If you specifically use the typed API:

```go
out, err := inst.InvokeValues(ctx, "work", values...)
```

The context needs a deadline or cancel function, and the same context must reach Wago. A background context has no cancellation signal. Blocking Go work in a host function must cooperate with cancellation; the guest deadline cannot make arbitrary Go code return.

On TinyGo, cancelable native calls require `-scheduler=threads`. See the [runnable cancellation test](../guides/embed/limits-and-policy#interrupt-a-guest-that-does-not-return). Compilation has no context parameter, so a call deadline does not cover `Runtime.Compile`.

## Concurrent instance calls

Public calls on one instance are serialized. Create separate instances from the same compiled module for parallel guest work, and synchronize any host state shared by their callbacks.

Raw results from `Invoke`, `InvokeContext`, and `WasmFunc.Invoke` are borrowed until the next invocation. Copy them before a later call. If several goroutines share one instance, an application lock must cover both the call and reading or copying its result; Wago's internal call serialization does not protect the returned slice after the call returns.

A `.wago` artifact caches compiled code, not an instance's memory or globals. Reusing an instance preserves mutations; creating another instance from the module starts fresh. There is no public instance reset or snapshot API.

## Shutdown timed out

`Runtime.Close` starts shutdown and can return before teardown finishes. Use `CloseContext` from the application shutdown path to wait, or `WaitClosed` after shutdown has started. A timed-out waiter does not cancel the remaining teardown.

Inside a callback, initiate runtime shutdown with `Close`; do not wait on the callback's own completion. Drain application requests separately from `Instance.WaitClosed`, which does not wait for physical release held by active calls or retained references.

## Report a reduced failure

Include the exact command or Go call, complete error, selected runtime, OS, architecture, module hash, and the smallest reproducer. For memory bugs, include the pointer, length, memory size, and guest signature.
