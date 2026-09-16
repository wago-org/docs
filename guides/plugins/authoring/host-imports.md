---
description: Add reflection-free host imports to a Wago plugin and handle values and guest memory safely.
---

# Add host imports

A host import is a Go function called by Wasm. The plugin's `host.import.define` grant names the exact import modules it may add.

## Get the registrar

```go
imports, err := reg.HostImports()
if err != nil {
	return err
}
```

Return `err` before registering functions. A grant for `acme_math` does not cover a parent, child, or wildcard name; flat registration preserves the exact module and function identity.

## Write the callback

```go
func addOne(value int32) int32 {
	return value + 1
}
```

Ordinary supported Go signatures are inferred without runtime reflection. Use `func(wago.HostCall)` for arbitrary supported scalar/reference arity, or `func(wago.Caller, wago.HostCall)` when the callback needs guest state.

## Declare its Wasm signature

```go
imports.HostFunc("acme_math", "add_one", addOne).
	Params(wago.ValI32).
	Results(wago.ValI32)
```

Wago checks that signature against the importing module.

## Guest memory

`Caller.Memory()` returns memory 0 for the duration of a caller-aware callback. Check the range before slicing and do not retain the slice, `Caller`, or `HostCall`.

```go
memory := caller.Memory()
offset := uint64(uint32(call.I32(0)))
if offset >= uint64(len(memory)) {
	return
}
```

Use `GuestStorageHostModule` for indexed memory, Memory64 metadata, exact GC types, or Wasm GC arrays. [examples/21-guest-storage](https://github.com/wago-org/wago/tree/main/examples/21-guest-storage) shows the checked borrow.

## Guest capabilities

Register a capability when the import gives Wasm a permission the host may deny:

```go
err := reg.GuestCapability(
	wago.Capability("clock.read"),
	wago.CapabilityDocs("read the host clock"),
)
```

The guest capability governs Wasm. The Plugin Authority governs trusted Go plugin code.

Run [examples/08-custom-plugin](https://github.com/wago-org/wago/tree/main/examples/08-custom-plugin) for a complete import and capability.
