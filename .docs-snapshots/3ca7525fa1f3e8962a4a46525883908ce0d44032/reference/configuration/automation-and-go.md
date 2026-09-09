---
description: Isolate Wago state, use automation flags and shell completions, and configure the Go runtime API.
---

# Configure CI, shells, and the Go API

Keep automation isolated from your normal Wago install, remove prompts from scripts, add shell completions, and set runtime policy from Go.

## Isolate Wago state

Set `WAGO_HOME` to place manager configuration, installed runtimes, and caches under one root:

```sh
WAGO_HOME="$PWD/.wago-ci" wago version current
```

Give concurrent CI jobs separate directories. Inspect paths rather than guessing:

```sh
wago status --json
wago version which
wago cache dir
```

## Automation flags

| Flag | Meaning |
|---|---|
| `--no-input` | Never prompt; fail if input is missing |
| `--dry-run` | Show a supported mutation plan |
| `--json` | Emit machine-readable output where supported |
| `--locked` | Refuse manifest or lockfile changes |
| `--offline` | Use installed and cached resources only |

For a prepared repeatable build:

```sh
wago run --locked --offline --invoke fib fib.wasm 20
```

Describe the command surface programmatically:

```sh
wago commands --json
```

## Shell completions

```sh
wago config completions zsh
wago config completions zsh --install
```

Use `--output` for a specific completion file and `--rc` for a particular startup file. Preview installation with `--dry-run`.

## Go API

Use `RuntimeConfig` for compiler policy and `WithPolicy` for per-instance guest limits. The runnable configuration example is in [Create runtimes and modules](/guides/embed/runtime-and-modules).
