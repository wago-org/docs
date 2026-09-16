---
description: Add, review, run, and update a Wago plugin step by step.
---

# Use plugins

This tutorial adds a plugin to a local Wago project and keeps the result reproducible. Use your own `module.wasm`; the plugin you choose must provide the imports or runtime features that module needs.

The workflow is:

```text
Project → add plugin → review access → build runtime → run module
```

Plugins are Go packages compiled into the Wago runtime. Review them as native dependencies, even when their requested Wago Authorities are narrow.

## Follow the tutorial

- [Create a local project and add a plugin](./plugins/install-and-scope).
- [Review the dependency graph, grants, and lockfile](./plugins/grants-and-lockfiles).
- [Run the module, update the plugin, and rebuild from the lockfile](./plugins/update-and-rebuild).

At the end, the project has a reviewed plugin runtime, a manifest that records what you requested, and a lockfile that can reproduce the exact build. Browse available packages at [plugins.wago.sh](https://plugins.wago.sh).
