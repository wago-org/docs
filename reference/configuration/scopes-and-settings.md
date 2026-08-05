---
description: Inspect and edit Wago settings in global or project scope, including experimental previews.
---

# Scopes and settings

## Inspect effective configuration

```sh
wago config
wago config list
wago config list --json
wago config diff
```

Inside a project, configuration commands use local scope by default. Be explicit in scripts:

```sh
wago config list --local
wago config list --global
```

## Get and set one value

```sh
wago config get optimizations.inline
wago config set optimizations.inline off --local
wago config set optimizations.inline on --global
```

Boolean values accept `on`/`off`, `true`/`false`, `yes`/`no`, and `1`/`0`.

The top-level editor supports one-shot changes too:

```sh
wago config --enable simd
wago config --disable inline
wago config --set runtime.parallel=auto
```

## Reset inheritance

```sh
wago config reset optimizations.inline --local
wago config reset --all --local
```

Resetting a local value removes the override. The project inherits the global value again.

## Experimental settings

```sh
wago config list --experimental
wago config set tail-call on --experimental
```

The available list comes from the selected runtime and architecture. Planned but unavailable features cannot be enabled.

Stable optimizations already use Wago's intended defaults. Override one for a measured workload, diagnosis, or controlled experiment.

## Precedence

<ComparisonTable :columns="['Scope', 'Overrides']">
  <ComparisonRow feature="Runtime defaults" :values="['Built-in', 'Nothing']" />
  <ComparisonRow feature="Global config" :values="['Runtime defaults', 'Project and flags']" />
  <ComparisonRow feature="Project config" :values="['Global config', 'Command flags']" />
  <ComparisonRow feature="Command flags" :values="['Everything below', 'Nothing']" />
</ComparisonTable>

## Next

- [Write project settings in wago.json](/reference/configuration/project-manifest)
- [Use configuration in automation and Go](/reference/configuration/automation-and-go)
- [Return to Configuration](/reference/configuration)
