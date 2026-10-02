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

Run [examples/22-language-guests](https://github.com/wago-org/wago/tree/main/examples/22-language-guests) to execute all three compiled guests against one host function. Run the pinned example directly from any directory:

```sh
go run github.com/wago-org/wago/examples/22-language-guests@b084a7c9343f81a9120ca80a13d133884e88d514
```

Expect `WAT answer = 42`, `AssemblyScript answer = 42`, and `TinyGo answer = 42`. Its build script reproduces the checked-in `.wasm` files.

## Check the guest before loading it

From the `wago-answer` directory created in [Write your first plugin](./first-plugin), inspect the downloaded guest:

```sh
wago module imports testdata/answer.wasm
wago module exports testdata/answer.wasm
```

Expect an import named `tutorial.answer` with signature `() -> i32` and an exported `run`. An `unresolved` import is expected here: the local Go test has not installed a CLI plugin. Run the local provider through its integration test:

```sh
go test ./register -run TestAnswerFromGuest -v
```

After publishing and [installing your own plugin](../install-and-scope) into the selected CLI runtime, the equivalent command is:

```sh
wago run testdata/answer.wasm --invoke run
```

The result is `42`. `--invoke run` selects the same export consistently, including guests with several exports. Wago can auto-select the WAT example's sole `run` function even though it has no `_start`.

TinyGo reactor-style guests may also export `_initialize`. Call it once before `run` on the same instance when the guest needs initialization:

```sh
wago run path/to/tinygo/answer.wasm --invoke _initialize --invoke run
```

The checked-in language example handles that initialization for its TinyGo guest. The build script requires the matching guest toolchains; the Go test uses the existing binaries and does not need to install them.
