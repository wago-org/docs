---
description: Add reflection-free host imports to a Wago plugin and handle values and guest memory safely.
---

# Add host imports

A host import is a Go function called by Wasm. The plugin's `host.import.define` grant names the exact import modules it may add.

## 1. Get the module

```go
imports, err := reg.HostImports()
if err != nil {
	return err
}
math, err := imports.Module("acme_math")
```

Return `err` before using `math`. A grant for `acme_math` does not cover a parent, child, or wildcard name.

## 2. Write the callback

```go
func addOne(_ wago.HostModule, params, results []uint64) {
	value := wago.AsI32(params[0])
	results[0] = wago.I32(value + 1)
}
```

Every callback uses this stack form. Each scalar or reference occupies one `uint64` slot; `v128` occupies two.

## 3. Declare its Wasm signature

```go
math.Func("add_one", addOne).
	Params(wago.ValI32).
	Results(wago.ValI32)
```

Wago checks that signature against the importing module.

## Guest memory

`HostModule.Memory()` returns memory 0 for the duration of the callback. Check the range before slicing and do not retain the slice.

```go
memory := caller.Memory()
offset := uint64(uint32(params[0]))
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
