---
description: Build Wago plugins with explicit providers, exact Authorities, host imports, lifecycle hooks, configuration, and typed Contracts.
---

# Author Wago plugins

A Wago plugin is a Go package linked into a generated runtime. It can define host imports, observe or intercept runtime work, manage instances, transform modules, extend the compiler, or provide a typed service to another plugin.

Start small. One definition, one provider, and one useful registration are enough for a real plugin.

## Start here

<CardGroup>
  <Card title="Write your first plugin" href="./plugins/authoring/first-plugin" icon="fa-play">
    Scaffold a module, define one host import, generate its catalog, and test it.
  </Card>
  <Card title="Definitions and providers" href="./plugins/authoring/definitions-and-providers" icon="fa-code">
    Describe what the plugin is, what it needs, and how Wago creates it.
  </Card>
  <Card title="Testing" href="./plugins/authoring/testing" icon="✓">
    Check definitions, registration, catalog drift, and clean installation.
  </Card>
  <Card title="Publish" href="./plugins/publish" icon="↗">
    Tag an open-source module and send its verified snapshot to the registry.
  </Card>
</CardGroup>

## Pick one next step

- To give Wasm a function, read [Host imports](./plugins/authoring/host-imports).
- To call it from a guest, compare [WAT, AssemblyScript, and TinyGo](./plugins/authoring/guest-languages).
- To own work or observe calls, read [Lifecycle and hooks](./plugins/authoring/lifecycle-and-hooks).
- To accept settings, read [Configuration](./plugins/authoring/configuration).
- To connect plugins, read [Contracts and dependencies](./plugins/authoring/contracts).
- To extend compilation, start with [Custom instructions](./plugins/authoring/custom-instructions), then [Custom types](./plugins/authoring/custom-types).

Each privileged handle needs an exact publisher-authored Authority request and a consumer-reviewed grant. If your plugin only needs a host import, do not ask for instance management or runtime hooks.

## Trust boundary

Plugins run as native Go code in the host process. Authorities limit access to Wago's privileged integration APIs; they do not sandbox file access, network access, process state, or other Go behavior. Keep the source public, keep dependencies narrow, and review plugins as native dependencies.

The complete runnable set lives in [Wago's examples directory](https://github.com/wago-org/wago/tree/main/examples).
