---
description: Define immutable Wago plugin metadata, explicit provider factories, and side-effect-free register catalogs.
---

# Definitions and providers

Every plugin has an immutable definition and an explicit provider. Wago can review and resolve the definition without constructing the plugin.

## `PluginDefinition`

The definition is published metadata, not runtime state. Give it a canonical `ID`, a semantic `Version`, and clear registry text through `Name`, `Description`, and `Stability`.

Record where the code came from in `Provenance`, and use `Compatibility` to state which Wago versions and platforms it supports. Add `Requires` for plugin dependencies, `Authorities` for privileged Wago APIs, `ConfigSchema` for user configuration, and `Provides` or `Consumes` for typed Contracts. Leave out sections the plugin does not need.

The definition must contain enough information to review the plugin before its code is downloaded or run. Keep reasons concrete: `define the acme_clock guest API` is useful; `needed by the plugin` is not.

## `PluginProvider`

The provider connects metadata to code:

```go
func Provider() wago.PluginProvider {
	return wago.PluginProvider{
		Definition: Definition,
		New: func() wago.Plugin {
			return &plugin{}
		},
		ValidateConfig: validateConfig,
	}
}
```

`New` must return a new plugin value suitable for one runtime load. Put per-runtime mutable state on that value instead of package globals. `ValidateConfig` is optional and handles semantic checks that the published schema cannot express.

## The `/register` catalog

A module exposes its providers through a conventional package:

```go
// Package register exposes this module's Wago providers.
package register

func Providers() []wago.PluginProvider {
	return []wago.PluginProvider{
		clock.Provider(),
		metrics.Provider(),
	}
}
```

Generated runtimes import `/register` and combine its returned values. Do not use `init` to register providers. Hidden global registration makes selection depend on import side effects and prevents an empty runtime from staying empty.

One Go module may publish several providers. Give each provider its own canonical ID and version, then return all of them from the root catalog. Use package dependencies when selecting one provider must also select another.

## Keep versions aligned

Before a release, these values must agree:

- `package.version` in `wago.json`;
- every published `PluginDefinition.Version` for that release;
- the Git tag, such as `v0.2.0`; and
- the committed `wago.providers.json` snapshot.

Publication rejects mismatched tagged metadata. Move to a new version instead of rewriting an existing tag.
