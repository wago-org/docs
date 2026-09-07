---
description: Call the same Wago plugin import from WAT, AssemblyScript, and TinyGo.
---

# Call a plugin from guest code

Plugin imports are ordinary Wasm functions. Use the syntax your guest language already provides for imported functions.

This example calls `tutorial.answer() -> i32`.

<Tabs sync="guest-language">
  <Tab title="WAT">

```wat
(import "tutorial" "answer" (func $answer (result i32)))
(func (export "run") (result i32)
  call $answer)
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
