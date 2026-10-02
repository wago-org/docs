---
description: Define an expression-scoped compiler value with a standard Wasm carrier and target-specific native representation.
---

# Add a custom compiler type

Custom types keep plugin-owned values in native registers across a chain of custom instructions. The guest still uses a standard Wasm type such as `externref` for validation.

## Register the type

Request `compiler.type.define` for the `example.value` namespace, then define the value:

```go
types, err := reg.CompilerTypes()
if err != nil {
    return err
}
value, err := types.Define(wago.CustomTypeSpec{
	Name:    "example.value/v256",
	Size:    32,
	Carrier: wago.WasmExternRef,
})
if err != nil {
    return err
}
```

The size must be positive and 16-byte aligned.

## Use the returned token

Also request `compiler.instruction.define` for the exact module containing the producer and consumer instructions (`example:types` in the runnable example). Get `reg.CompilerInstructions()` as in [Custom instructions](./custom-instructions), then add the token to an instruction signature:

```go
Custom: &wago.CustomSignature{
	Inputs: []wago.CustomType{value, value},
	Output: &value,
},
```

The token belongs to that compiler registry. It cannot be forged or moved to another registry.

## Provide native code

A custom value has no portable handler. Add target-specific lowerings in `codegen_amd64.go` and `codegen_arm64.go`. The lowering receives and returns the native register bundle through `InputCustom` and `OutputCustom`.

Custom values currently have expression lifetime. They can flow directly between custom calls or be dropped. They cannot enter Wasm locals, cross control flow, pass to ordinary functions, or return from the guest.

Run [examples/19-custom-type](https://github.com/wago-org/wago/tree/main/examples/19-custom-type). Its WAT guest uses `externref`; the plugin keeps the 256-bit value in one AMD64 YMM register or two ARM64 vector registers.

Run the published example without a source checkout:

```sh
go run github.com/wago-org/wago/examples/19-custom-type@b084a7c9343f81a9120ca80a13d133884e88d514
```
