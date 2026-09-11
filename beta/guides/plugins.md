---
description: Add, review, compose, update, lock, and publish Wago plugins without hiding their host authority.
---

# Use plugins

Plugins provide host imports, lifecycle integrations, managed instances, module transforms, compiler extensions, and typed services for other plugins. They are Go code compiled into your runtime, so review them like any other native dependency.

If you have not installed a plugin before, start with [Using plugins](../using-plugins) to add WASI and run a small module.

Wago resolves explicit package dependencies and typed, major-versioned Contracts
as one graph. It reviews exact scoped Plugin Authorities before downloading or
building new code, then publishes the manifest, lock graph, and generated runtime
in one transaction.

## Pick a topic

<CardGroup>
  <Card title="Install and choose scope" href="./plugins/install-and-scope" icon="fa-plug">
    Add a plugin locally or globally and select it at run time.
  </Card>
  <Card title="Grants and lockfiles" href="./plugins/grants-and-lockfiles" icon="fa-code">
    Review exact Authorities, dependency and Contract bindings, guest capabilities, and reproducible state.
  </Card>
  <Card title="Update and rebuild" href="./plugins/update-and-rebuild" icon="fa-right-left">
    Check for updates, review changes, and reproduce the locked runtime.
  </Card>
  <Card title="Write a plugin" href="./plugin-authoring" icon="fa-code">
    Start with a working host import, then add lifecycle hooks, configuration, or Contracts.
  </Card>
  <Card title="Plugin FAQ" href="./plugins/faq" icon="?">
    Get short answers about builds, trust, scopes, lockfiles, and publishing.
  </Card>
</CardGroup>

Browse published packages at [plugins.wago.sh](https://plugins.wago.sh).
