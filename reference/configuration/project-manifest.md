---
description: Configure Wago runtime features, optimizations, workers, and plugins in wago.json.
---

# Project manifest

`wago.json` combines sparse project runtime settings with plugin requirements:

```json
{
  "$schema": "https://wago.sh/v0/schema.json",
  "settings": {
    "features": {
      "simd": true
    },
    "optimizations": {
      "inline-loop-callees": false
    },
    "runtime": {
      "parallel": "auto",
      "deferredBoundsChecking": true
    }
  },
  "plugins": {
    "wago-org/wasi": "^0.0.0"
  }
}
```

Add the schema URI for editor completion and typo detection. The draft-2020-12 schema rejects unknown fields.

Create a minimal project:

```sh
wago init --run
```

## Feature settings

`settings.features` enables or disables WebAssembly feature families. The runtime defaults to Core 2 compatibility; `--core 3` selects the complete supported Core 3 group for commands that expose it.

Use individual settings when a project needs a narrower feature policy.

## Optimization settings

```json
{
  "settings": {
    "optimizations": {
      "inline": false
    }
  }
}
```

The names match CLI switches such as `--no-inline`. Architecture-specific optimizations may not exist on another target.

## Runtime settings

`settings.runtime.parallel` accepts `"auto"` or a non-negative worker count encoded as a string.

- `"auto"` uses adaptive work.
- `"1"` forces serial function work.
- A larger number sets a maximum.

`deferredBoundsChecking` controls whether Wago may omit explicit checks already proven redundant.

## Plugins and lockfile state

`plugins` maps GitHub-relative IDs to semantic-version constraints. Exact resolution, grants, budgets, and opaque plugin configuration belong in `wago-lock.json`.

Commit both files. Keep plugin configuration out of `settings`; it belongs to the plugin's reviewed lock entry.

## Publish metadata

When the manifest describes a publishable plugin, it can also contain module path, semantic version, display metadata, SPDX license, public repository, tags, authors, platform constraints, and subpackages.

See [Publish a plugin](/guides/plugins/publish) for the complete workflow.

## Next

- [Review plugin grants and lockfiles](/guides/plugins/grants-and-lockfiles)
- [Inspect scopes and inherited settings](/reference/configuration/scopes-and-settings)
- [Return to Configuration](/reference/configuration)
