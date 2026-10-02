---
description: Run and inspect Wasm, build standalone executables, and diagnose Wago workloads from the terminal.
---

# Use the CLI

Start with [installation and your first module](../getting-started). These guides cover the next steps:

- [Run and inspect modules](./cli/running-modules): choose exports, pass arguments, inspect metadata, watch files, and reuse compiled code
- [Build a standalone executable](./cli/standalone): package a module with Go or TinyGo so it runs without an installed Wago command
- [Profile and debug a workload](./cli/profiling): reproduce traps, collect a checked workload, and read timing or CPU reports
- [Configure Wago](./cli/configuration): keep project settings and compiler options consistent

## Find the right command

```sh
wago run --help
wago module --help
wago build --help
wago compile --help
wago run --help-optimizations
```

`run` executes Wasm. `build` saves a host-specific `.wago` artifact for later use by Wago. `compile` produces a standalone executable containing the runtime and precompiled guest code.

For machine-readable inspection, add `--json` to `validate`, `module imports`, `module exports`, or `module capabilities`. The available flags depend on the selected runtime's platform and build profile; use its help output when a flag is missing.
