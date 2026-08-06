---
description: Diagnose Wago Go API host signatures, guest memory access, cancellation, and instance concurrency.
---

# Fix Go API and guest memory problems

Start at the host-to-Wasm boundary: import signatures, checked memory ranges, context cancellation, and instance ownership.

## Host import mismatch

Import keys use `module.name`. The value must be `wago.HostFunc` or a compatible `*wago.HostFuncRef` with the exact guest signature.

Inspect the module first:

```sh
wago module imports fib.wasm
```

Then compare the parameter and result slots with the guest declaration.

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

`HostModule.Memory()` is valid only during that synchronous callback. Copy bytes that must survive it.

## Cancellation does not stop work

Use a context-aware call:

```go
out, err := inst.Call(ctx, "work", args...)
```

or the low-level form:

```go
out, err := inst.InvokeContext(ctx, "work", slots...)
```

The context needs a deadline or cancel function, and the same context must reach Wago. Blocking Go work in a host function needs separate cancellation.

## Concurrent instance calls

One instance cannot execute simultaneous public calls. Create separate instances from the same compiled module for parallel guest work.

## Report a reduced failure

Include the exact command or Go call, complete error, selected runtime, OS, architecture, module hash, and the smallest reproducer. For memory bugs, include the pointer, length, memory size, and guest signature.
