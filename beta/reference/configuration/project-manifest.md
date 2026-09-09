---
description: Configure Wago runtime features, optimizations, workers, and plugins in wago.json.
---

# Configure `wago.json`

`wago.json` combines sparse project runtime settings with plugin requirements:

```json
{
  "$schema": "https://wago.sh/v1/schema.json",
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
    "github.com/wago-org/wasi": "^0.1.0"
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

`plugins` maps canonical Go module or package paths to semantic-version ranges.
Exact direct and transitive sources, checksums, release fingerprints, definition
digests, dependency edges, requested and granted Authorities, Contract bindings,
and opaque plugin configuration belong in `wago-lock.json`.

Ranges support exact, comparator, caret, tilde, partial/x, hyphen, intersection,
and `||` union forms. Relative aliases are invalid: use
`github.com/wago-org/wasi`, not `wago-org/wasi`.

Commit both files. Keep plugin configuration out of `settings`; it belongs to the plugin's reviewed lock entry.

## Publish metadata

When the manifest describes a publishable plugin, public metadata lives under a
`package` object:

```json
{
  "$schema": "https://wago.sh/v1/schema.json",
  "package": {
    "module": "github.com/acme/wago-observability",
    "version": "0.1.0",
    "name": "Wago Observability",
    "description": "Tracing and metrics for Wago runtimes.",
    "license": "Apache-2.0",
    "repository": "https://github.com/acme/wago-observability",
    "authors": [
      { "name": "Example Maintainer", "github": "example" }
    ]
  }
}
```

Provider definitions, Authorities, configuration schemas, and Contracts are not
duplicated by hand in this file. Publishing obtains them from the module's
explicit `/register` catalog and stores their canonical digests beside the
release.

The committed module-root `wago.providers.json` is the immutable catalog
snapshot. Generate it with `wago plugin catalog`, verify it in CI with
`wago plugin catalog --check`, and commit it before creating the release tag.
It uses `https://wago.sh/v1/providers.schema.json`.

See [Publish a plugin](/guides/plugins/publish) for the complete workflow.
