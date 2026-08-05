---
description: Isolate Wago state, use automation flags and shell completions, and configure the Go runtime API.
---

# Automation and Go

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
wago run --locked --offline app.wasm
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

## Configure the Go API

```go
cfg := wago.NewRuntimeConfig().
	WithCoreFeatures(wago.CoreFeaturesV3).
	WithMemoryLimitPages(256).
	WithFunctionWorkers(0)

if err := cfg.Validate(); err != nil {
	return err
}

rt := wago.NewRuntime(wago.WithRuntimeConfig(cfg))
```

Use `WithBoundsChecks`, `WithDeferBoundsChecks`, and `WithOptimization` for narrower compiler choices. Use `WithPolicy` during instantiation for guest authority and declared resource limits.

## Next

- [Pin runtimes in CI](/guides/versions/updates-and-automation)
- [Configure project settings](/reference/configuration/project-manifest)
- [Return to Configuration](/reference/configuration)
