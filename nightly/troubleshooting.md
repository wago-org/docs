---
description: Fix common Wago installation, runtime, module, export, plugin, and precompiled-artifact problems.
---

# Troubleshooting

Start with these two commands:

```sh
wago status
wago --version
```

They tell you which manager and runtime Wago selected. Many first-run problems are simply a missing runtime or an unexpected plugin scope.

## `wago: command not found`

The manager is usually installed in `~/.wago/bin` on macOS. Open a new terminal after installation, or add it for the current shell:

```sh
export PATH="$HOME/.wago/bin:$PATH"
```

If you chose a different directory, use that path instead. Re-running the installer is safe and offers repair modes.

## `no active runtime is selected`

Install and activate one:

```sh
wago version install --nightly --use
```

The manager is present; only the execution runtime is missing.

## The module has unresolved imports

Inspect the boundary:

```sh
wago module imports app.wasm
wago module capabilities app.wasm
wago plugin list
```

Then add the plugin that intentionally provides those imports, or implement them in your Go host. Do not add WASI merely because the file is WebAssembly; modules with no WASI imports do not need it.

Use `wago run --bare app.wasm` to separate module problems from plugin-selection problems.

## Wago cannot find the export

Choose it explicitly:

```sh
wago run -e run app.wasm
```

Guest toolchains often rename or wrap functions. Confirm the exported name and signature in the generated Wasm rather than assuming the source-language function name survived unchanged.

## An argument has the wrong type

Wago parses arguments from the export signature. Add a suffix when needed:

```sh
wago run -e hypot math.wasm 3:f64 4:f64
```

If the count is wrong, fix the call rather than padding it. WebAssembly function signatures are exact.

## A `.wago` file stopped loading

Rebuild it from the original `.wasm`:

```sh
wago build app.wasm -o app.wago
```

Precompiled artifacts are host-architecture-specific and may become incompatible after Wago's compiled format changes.

## The wrong plugins are active

Check the selected scope:

```sh
wago status
wago plugin list
```

Then make the choice explicit:

```sh
wago run --local app.wasm
wago run --global app.wasm
wago run --bare app.wasm
```

A local `wago.json` replaces the global plugin set. The two are not merged.

## CI opened a prompt or changed project files

Use automation policy flags:

```sh
wago --no-input --locked run app.wasm
```

Add `--offline` when the job must use only installed and cached resources. Use `--json` on commands that advertise structured output.

## You still cannot explain the failure

Collect the smallest useful report:

```sh
wago status --json
wago module imports app.wasm --json
wago module capabilities app.wasm --json
wago --version
```

Then open an issue at [github.com/wago-org/wago/issues](https://github.com/wago-org/wago/issues) with the command, complete error, operating system, architecture, and a minimal module when it can be shared.
