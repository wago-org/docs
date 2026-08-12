---
description: Add, review, compose, update, lock, and publish Wago plugins without hiding their host authority.
---

# Use plugins

Plugins provide host imports, lifecycle integrations, managed instances, module transforms, compiler extensions, and typed services for other plugins. They are Go code compiled into your runtime, so review them like any other native dependency.

Wago resolves explicit package dependencies and typed, major-versioned Contracts
as one graph. It reviews exact scoped Plugin Authorities before downloading or
building new code, then publishes the manifest, lock graph, and generated runtime
in one transaction.

## Pick a topic

<CardGroup>
  <Card title="Install and choose scope" href="/guides/plugins/install-and-scope" icon="fa-plug">
    Add a plugin locally or globally and select it at run time.
  </Card>
  <Card title="Grants and lockfiles" href="/guides/plugins/grants-and-lockfiles" icon="fa-code">
    Review exact Authorities, dependency and Contract bindings, guest capabilities, and reproducible state.
  </Card>
  <Card title="Update and rebuild" href="/guides/plugins/update-and-rebuild" icon="fa-right-left">
    Check for updates, review changes, and reproduce the locked runtime.
  </Card>
  <Card title="Publish a plugin" href="/guides/plugins/publish" icon="fa-play">
    Create an open-source manifest, authenticate, and publish a release.
  </Card>
</CardGroup>

Browse published packages at [plugins.wago.sh](https://plugins.wago.sh).
