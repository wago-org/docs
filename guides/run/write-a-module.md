---
description: Export a small WebAssembly function from WAT, AssemblyScript, or TinyGo, then inspect and run it with Wago.
---

# Write a module Wago can run

Wago runs core WebAssembly. Your source language only needs to produce a `.wasm` file with an exported function.

This tutorial builds the same `add(i32, i32) -> i32` export three ways. Pick one language and ignore the other tabs.

## 1. Write the export

<Tabs>
  <Tab title="WAT">

```wat
(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add
  )
)
```

Save this as `add.wat`.

  </Tab>
  <Tab title="AssemblyScript">

```ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

Save this as `add.ts`.

  </Tab>
  <Tab title="TinyGo">

```go
package main

//go:wasmexport add
func add(a, b int32) int32 { return a + b }

func main() {}
```

Save this as `add.go`.

  </Tab>
</Tabs>

## 2. Build the Wasm file

<Tabs>
  <Tab title="WAT">

```sh
wat2wasm add.wat -o add.wasm
```

  </Tab>
  <Tab title="AssemblyScript">

```sh
npx asc add.ts --runtime stub --outFile add.wasm
```

  </Tab>
  <Tab title="TinyGo">

```sh
tinygo build -target=wasm-unknown -no-debug -o add.wasm add.go
```

  </Tab>
</Tabs>

Use [WABT](https://github.com/WebAssembly/wabt), [AssemblyScript](https://www.assemblyscript.org/getting-started.html), or [TinyGo](https://tinygo.org/getting-started/install/) for the matching compiler.

## 3. Check the boundary

```sh
wago module exports add.wasm
```

Confirm that `add` accepts two `i32` values and returns one `i32`. If an export is missing, fix the source or compiler settings before debugging Wago.

## 4. Run it

```sh
wago run --invoke add add.wasm 20 22
```

Imports work the same way in each language. Inspect them with `wago module imports`, then provide them through a plugin or your Go host. [Call a plugin from guest code](/guides/plugins/authoring/guest-languages) shows the three language spellings side by side.
