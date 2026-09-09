---
description: Define a custom imported operation with portable semantics and an optional native compiler lowering.
---

# Add a custom instruction

A custom instruction starts as an ordinary function import. Wago replaces calls to that import while compiling the guest.

## 1. Pick the guest ABI

This WAT import carries two four-bit values through normal `i32` parameters:

```wat
(import "wago:instr/example.int" "i4.add"
  (func $i4.add (param i32 i32) (result i32)))
```

Any language that can emit the same import can use it.

## 2. Request the module

Request `compiler.instruction.define` with `wago:instr/example.int` in `Scope.Modules`.

## 3. Define its meaning

Get `Registrar.CompilerInstructions`, then define the logical widths and portable handler:

```go
Input:  []int32{4, 4},
Output: []int32{4},
Handler: func(_ wago.InstructionContext, in []wago.Bits) ([]wago.Bits, error) {
	value, err := wago.BitsFromUint32(4, in[0].Uint32()+in[1].Uint32())
	return []wago.Bits{value}, err
},
```

The handler is the fallback and the executable definition of the operation.

## 4. Add a scalar lowering

```go
Lower: func(ctx wago.LoweringContext) error {
	ctx.Output(0, ctx.Add(ctx.Input(0), ctx.Input(1)))
	return nil
},
```

Wago can inline this recipe on supported backends. The portable handler remains available elsewhere.

Use target-specific code generation only when the scalar recipe cannot express the operation. Raw AMD64 or ARM64 emission is trusted backend code and needs architecture-tagged files.

Run [examples/18-custom-instruction](https://github.com/wago-org/wago/tree/main/examples/18-custom-instruction) for the complete plugin and WAT guest.
