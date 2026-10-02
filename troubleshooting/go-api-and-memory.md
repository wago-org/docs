---
description: Diagnose Wago Go API host signatures, guest memory access, cancellation, and instance concurrency.
---

# Fix Go API and guest memory problems

Start at the host-to-Wasm boundary: import signatures, checked memory ranges, context cancellation, and instance ownership.

## The example does not compile

Check the dependency selected in your Go project:

```sh
go list -m github.com/wago-org/wago
```

The canary [embedding walkthrough](../guides/embed/runtime-and-modules) uses `go get github.com/wago-org/wago@main`. `@latest` selects a tagged release, so use the matching release docs or deliberately update your dependency. Run each complete program as a replacement for `main.go`, not alongside another example that also declares `main`.

If TinyGo reports an unsupported Go version, put a Go version supported by your TinyGo release on `PATH` before creating the project. A `go.mod` created with a newer Go version can also force a newer toolchain. Check `go version`, `tinygo version`, and the `go` directive in `go.mod`; do not assume every Go version above Wago's minimum is supported by TinyGo.

## Host import mismatch

Both the module name and field name must match the guest, including case. Create imports with `wago.NewImports()` and register callbacks with `imports.HostFunc(module, name, fn)`. Module and function names remain separate exact identities. Wago checks the callback and declared signature before guest startup.

If you have the [Wago CLI installed](../getting-started), inspect the module first. For the guest from [Host functions](../guides/embed/host-functions):

```sh
wago module imports square.wasm
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
