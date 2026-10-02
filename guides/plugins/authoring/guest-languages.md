---
description: Call the same Wago plugin import from WAT, AssemblyScript, and TinyGo.
---

# Call a plugin from guest code

Plugin imports are ordinary Wasm functions. Use the syntax your guest language already provides for imported functions.

This example calls `tutorial.answer() -> i32`.

<Tabs sync="guest-language">
  <Tab title="WAT">

```wat
(module
  (import "tutorial" "answer" (func $answer (result i32)))
  (func (export "run") (result i32)
    call $answer))
```

  </Tab>
  <Tab title="AssemblyScript">

```ts
@external("tutorial", "answer")
declare function answer(): i32;

export function run(): i32 {
  return answer();
}
```

  </Tab>
  <Tab title="TinyGo">

```go
//go:wasmimport tutorial answer
func answer() int32

//go:wasmexport run
func run() int32 { return answer() }
```

  </Tab>
</Tabs>

The module name, function name, parameters, and results must match the plugin declaration.

Run [examples/22-language-guests](https://github.com/wago-org/wago/tree/main/examples/22-language-guests) to execute all three compiled guests against one host function. Its build script reproduces the checked-in `.wasm` files.

## Check the guest before loading it

```sh
wago module imports answer.wasm
wago module exports answer.wasm
```

Expect an import named `tutorial.answer` with signature `() -> i32` and an exported `run`. With the plugin installed in the selected runtime:

```sh
wago run answer.wasm --invoke run
```

The result is `42`. `--invoke run` selects the same export consistently, including guests with several exports. Wago can auto-select the WAT example's sole `run` function even though it has no `_start`.

TinyGo reactor-style guests may also export `_initialize`. Call it once before `run` on the same instance when the guest needs initialization:

```sh
wago run answer.wasm --invoke _initialize --invoke run
```

The checked-in language example handles that initialization for its TinyGo guest. The build script requires the matching guest toolchains; the Go test uses the existing binaries and does not need to install them.
