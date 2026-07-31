---
description: Configure Wago projects, plugin constraints, reproducible lockfiles, capability grants, and machine-level paths.
---

# Configuration

Wago keeps project intent in `wago.json` and exact, authority-bearing resolution in `wago-lock.json`. Commit both files when your project uses plugins.

::: tip Editor support
Add the schema URL to get completion, inline documentation, and typo detection in editors that support JSON Schema.
:::

## Start a project

<Tabs sync="project-setup">
  <Tab title="Interactive">

```sh
wago init
```

Choose quick setup for a minimal manifest or full setup for an application or publishable plugin.

  </Tab>
  <Tab title="Quick">

```sh
wago init --quick
```

  </Tab>
  <Tab title="Scripted">

```sh
wago init --full --kind application --name demo --yes
```

  </Tab>
</Tabs>

## Manifest

```json
{
  "$schema": "https://wago.sh/v0/schema.json",
  "plugins": {
    "wago-org/wasi": "^0.0.0"
  }
}
```

Plugin entries are semantic-version constraints. `wago add` updates the manifest and resolves exact versions into the lockfile.

<ApiEndpoint method="FILE" path="wago.json">
  Human-authored project intent, package metadata, and plugin constraints.
</ApiEndpoint>

<ApiEndpoint method="LOCK" path="wago-lock.json">
  Exact plugin versions, reviewed capability grants, and plugin-owned configuration.
</ApiEndpoint>

::: warning Keep authority in the lockfile
Do not copy exact resolutions or capability grants into `wago.json`. The lockfile is parsed strictly and is the reproducible source of runtime authority.
:::

## Add and inspect plugins

```sh
wago add wago-org/wasi
wago plugin list
wago plugin check
wago plugin plan
```

Use `wago status` for a compact view of the active runtime, project scope, plugins, and lockfile.

## Machine-level paths

`WAGO_HOME` overrides the platform defaults. Without it, macOS keeps Wago state under `~/.wago`; Linux uses the corresponding XDG data, config, and cache directories.

```sh
export WAGO_HOME="$PWD/.wago-home"
wago status
```
