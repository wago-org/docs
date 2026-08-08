---
description: Inspect and edit Wago settings in global or project scope, including experimental previews.
---

# Configure global and project settings

Inspect the effective value first, then decide whether the change belongs to the whole machine or only the current project.

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

## Reset inheritance

```sh
wago config reset optimizations.inline --local
wago config reset --all --local
```

Resetting a local value removes the override. The project inherits the global value again.

## Precedence

<ComparisonTable :columns="['Scope', 'Overrides']">
  <ComparisonRow feature="Runtime defaults" :values="['Built-in', 'Nothing']" />
  <ComparisonRow feature="Global config" :values="['Runtime defaults', 'Project and flags']" />
  <ComparisonRow feature="Project config" :values="['Global config', 'Command flags']" />
  <ComparisonRow feature="Command flags" :values="['Everything below', 'Nothing']" />
</ComparisonTable>
