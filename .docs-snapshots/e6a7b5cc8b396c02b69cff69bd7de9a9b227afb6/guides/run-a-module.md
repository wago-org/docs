---
description: Follow a WebAssembly module from download through inspection, validation, execution, watch mode, and precompilation.
---

# Run a module from the command line

We will use a small Fibonacci module to inspect a guest's boundary, call an export, and build a precompiled `.wago` file. The module does not need access to your files, network, clock, or environment.

::: tip Before you start
You need Wago with an active runtime. If `wago --version` does not show a runtime, finish [Getting started](/getting-started) first.
:::

## 1. Make a working directory

```sh
mkdir wago-fib
cd wago-fib
```

Download the example module:

```sh
curl -fsSL \
  https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm \
  -o fib.wasm
```

The file is only 88 bytes, but it is a complete WebAssembly module with an exported `fib` function.

## 2. Check what the module expects from its host

```sh
wago module imports fib.wasm
```

You should see:

```text
module has no imports
```

Imports are the functions, memories, tables, and globals a module expects the host to provide. Checking them before execution tells you whether the module needs WASI, a plugin, or host functions of your own.

When a script needs the result, ask for JSON:

```sh
wago module imports fib.wasm --json
```

## 3. Validate without running it

```sh
wago validate fib.wasm
```

Success is quiet. A malformed binary, invalid function body, or unsupported feature fails here before guest code runs.

## 4. Call the exported function

```sh
wago run fib.wasm 30
```

The result should be:

```text
fib(30) = 832040
```

`run` is the default command, so the shorter form works too:

```sh
wago fib.wasm 30
```

Wago found the callable export and parsed `30` from its Wasm signature. If a module has several callable exports, name the one you want:

```sh
wago run -e fib fib.wasm 30
```

For floating-point or ambiguous values, add a scalar suffix such as `i32`, `i64`, `f32`, or `f64`:

```sh
wago run -e hypot math.wasm 3:f64 4:f64
```

## 5. Rerun after every rebuild

If another tool is writing `fib.wasm`, keep Wago open in a second terminal:

```sh
wago run --watch fib.wasm 30
```

Wago polls the file and runs it again after a change. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> when you are done. For toolchains that write slowly or replace files through several renames, increase the polling interval:

```sh
wago run --watch --watch-interval 500ms fib.wasm 30
```

## 6. Precompile the module

```sh
wago build fib.wasm -o fib.wago
```

Then run the compiled artifact:

```sh
wago run fib.wago 30
```

You should get the same `832040` result. The `.wago` file skips decoding, validation, and native compilation on later starts. Instantiation still happens each time.

::: warning Keep the original `.wasm`
A `.wago` file is tied to the host architecture and Wago's compiled format. Rebuild it after an incompatible Wago upgrade, and do not use it as a portable release artifact.
:::

Large modules can opt into Wago's adaptive worker policy:

```sh
wago build -p app.wasm
wago build -p8 app.wasm
```

Start without `-p`. Parallel compilation pays off only when the module has enough functions to cover its coordination cost.

## 7. Make CI predictable

Use policy flags when a command must never prompt, edit project files, or reach the network:

```sh
wago --no-input --locked --offline run app.wasm
```

- `--no-input` refuses to open a picker or confirmation prompt.
- `--locked` prevents changes to `wago.json` and `wago-lock.json`.
- `--offline` uses installed runtimes and cached modules only.

For tooling, `wago commands --json` returns the command schema. It is safer than scraping colored help text.

## Next: call it from Go

Your directory now contains the portable source module and a host-specific compiled artifact:

```text
wago-fib/
├── fib.wasm
└── fib.wago
```

Continue with [Embed Wago in Go](/guides/embed-wago) to call the same module from an application.
