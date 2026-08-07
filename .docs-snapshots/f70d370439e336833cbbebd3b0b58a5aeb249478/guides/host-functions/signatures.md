---
description: Bind Wago host imports and encode WebAssembly parameters and results in portable slots.
---

# Bind host function signatures and slots

Suppose the guest imports:

```wat
(import "host" "mul" (func $mul (param i32 i32) (result i32)))
```

Implement it in Go:

```go
mul := wago.HostFunc(func(
	_ wago.HostModule,
	params []uint64,
	results []uint64,
) {
	a := wago.AsI32(params[0])
	b := wago.AsI32(params[1])
	results[0] = wago.I32(a * b)
})
```

Bind it during instantiation:

```go
inst, err := rt.Instantiate(ctx, mod, wago.WithImports(wago.Imports{
	"host.mul": mul,
}))
```

The key joins the import module and field with a dot. Wago already knows the signature from the guest and rejects unsupported host values.

## Scalar slots

| Wasm type | Read parameter | Write result |
|---|---|---|
| `i32` | `wago.AsI32(params[i])` | `results[i] = wago.I32(v)` |
| `i64` | `wago.AsI64(params[i])` | `results[i] = wago.I64(v)` |
| `f32` | `wago.AsF32(params[i])` | `results[i] = wago.F32(v)` |
| `f64` | `wago.AsF64(params[i])` | `results[i] = wago.F64(v)` |

An `i32` or `f32` uses the low 32 bits. A `v128` occupies two adjacent little-endian slots. References use opaque tokens; never reinterpret one as a Go pointer.

The result slice is already sized for the signature. Write into it. Appending does not return another Wasm result.
