---
description: Create a Wago project, add a plugin, inspect its capabilities, and commit a reproducible manifest and lockfile.
---

# Use plugins in a project

Plugins add reusable host integrations to Wago. We will create a project, add the WASI plugin, and look at where Wago records your version request and the exact result.

Plugins are open-source Go modules compiled into a project-specific runtime. They run as host code, so read their source and capability requests before approving them.

## 1. Create a project

```sh
mkdir wago-plugin-demo
cd wago-plugin-demo
wago init --quick
```

Wago creates `wago.json` in the current directory. Use `wago init` without `--quick` when you want the guided setup.

Open the file before continuing. A new manifest is small and includes a schema URL so editors can validate it.

## 2. Add WASI

```sh
wago add wago-org/wasi
```

Wago resolves a compatible Go module, verifies it through the Go module system, shows the capabilities it requests, updates the project files, and builds a plugin-aware runtime.

Read the capability prompt. WASI can expose operating-system services such as files, clocks, arguments, or environment values depending on its configuration. Approve only what the guest needs.

When several plugins must resolve together, add them in one transaction:

```sh
wago add wago-org/wasi wago-org/workers
```

## 3. Compare intent with the resolved result

Your `wago.json` records the version range you chose:

```json
{
  "$schema": "https://wago.sh/v0/schema.json",
  "plugins": {
    "wago-org/wasi": "^0.0.0"
  }
}
```

`wago-lock.json` records the exact version, reviewed capabilities, limits, and plugin-owned configuration.

Commit both files. The manifest says what the project accepts. The lockfile pins what Wago resolved and what you authorized.

## 4. Inspect the selected runtime

```sh
wago status
wago plugin list
wago plugin inspect wago-org/wasi
```

`status` answers a common debugging question: which manager, runtime, project, profile, build, and plugin scope did this command select?

## 5. Compare the guest with the host

Before running a real application module, inspect what it imports:

```sh
wago module imports app.wasm
wago module capabilities app.wasm
```

The module commands describe what the guest asks for. The plugin commands describe what the runtime provides. Compare those two lists when Wago reports a missing import.

Do not add WASI merely because a file is WebAssembly. A self-contained module such as the Fibonacci example has no imports and gains nothing from a WASI plugin.

## 6. Run with an explicit scope

Inside this directory, Wago selects the local project by default:

```sh
wago run app.wasm
wago run --local app.wasm
```

Global plugins are useful for personal tools outside a project:

```sh
wago add --global wago-org/wasi
wago run --global app.wasm
```

A local manifest replaces the global plugin set. Wago does not merge the two. To test the module without either set:

```sh
wago run --bare app.wasm
```

`--bare` is a useful diagnostic. If the module still fails before import resolution, the problem is probably in the module rather than plugin selection.

## 7. Review before committing

Run through this short check:

1. Open the plugin's repository and read its license.
2. Check the exact version in `wago-lock.json`.
3. Understand each capability and configured limit.
4. Run `wago status` and confirm the project scope.
5. Commit `wago.json` and `wago-lock.json` together.

Browse published packages at [plugins.wago.sh](https://plugins.wago.sh/). Prefer plugins with a small, clear capability set that matches the guest's imports.
