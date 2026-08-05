---
description: Call typed WebAssembly exports, honor cancellation, and access instance memory and globals.
---

# Calls and guest state

## Call an export

```go
result, err := inst.Call(
	ctx,
	"add",
	wago.ValueI32(20),
	wago.ValueI32(22),
)
if err != nil {
	return err
}

fmt.Println(result[0].I32()) // 42
```

`Call` checks the values against the export's Wasm signature.

| Wasm type | Constructor | Reader |
|---|---|---|
| `i32` | `wago.ValueI32(v)` | `value.I32()` |
| `i64` | `wago.ValueI64(v)` | `value.I64()` |
| `f32` | `wago.ValueF32(v)` | `value.F32()` |
| `f64` | `wago.ValueF64(v)` | `value.F64()` |

SIMD and reference types have dedicated values too. Check `value.Type()` when the signature is discovered dynamically.

## Honor cancellation

```go
ctx, cancel := context.WithTimeout(parent, 250*time.Millisecond)
defer cancel()

out, err := inst.Call(ctx, "work", wago.ValueI32(1000))
```

A background context keeps the ordinary fast path. A cancellable context lets Wago interrupt long-running guest execution. Blocking Go work inside a host function still needs its own deadline.

## Read and write memory

```go
if ok := inst.Write(128, []byte("hello")); !ok {
	return fmt.Errorf("guest memory write is out of bounds")
}

data, ok := inst.Read(128, 5)
if !ok {
	return fmt.Errorf("guest memory read is out of bounds")
}
fmt.Println(string(data))
```

`Read` returns a copy. Typed little-endian helpers include `ReadUint32Le`, `ReadUint64Le`, `WriteUint32Le`, and their floating-point counterparts.

For zero-copy access to the default memory, use `Instance.Memory().Bytes()`. The returned view reflects live guest state, so keep instance serialization rules in mind.

## Read and write globals

```go
count, err := inst.GlobalValue("count")
if err != nil {
	return err
}
fmt.Println(count.I32())

if err := inst.SetGlobalValue("count", wago.ValueI32(100)); err != nil {
	return err
}
```

Setting an immutable global or supplying the wrong value type returns an error.

## Low-level calls

Package-level `Compile`, `Instantiate`, and `Invoke` use raw `uint64` slots with helpers such as `wago.I32` and `wago.AsI32`. Use that path for a deliberately low-level embedder. The runtime API is the better default for typed values, context, plugins, and lifecycle.

## Next

- [Supply imports and load artifacts](/guides/embed/imports-and-artifacts)
- [Implement host functions](/guides/host-functions)
- [Troubleshoot Go API calls](/troubleshooting/go-api-and-memory)
