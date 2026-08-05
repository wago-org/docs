---
description: Add, review, update, lock, and publish Wago plugins without hiding their host authority.
---

# Use plugins

Plugins provide host imports, lifecycle hooks, managed instances, module transforms, and compiler extensions. They are Go code compiled into your runtime, so review them like any other native dependency.

## Pick a topic

<CardGroup>
  <Card title="Install and choose scope" href="/guides/plugins/install-and-scope" icon="fa-plug">
    Add a plugin locally or globally and select it at run time.
  </Card>
  <Card title="Grants and lockfiles" href="/guides/plugins/grants-and-lockfiles" icon="fa-code">
    Review privileged API access, guest capabilities, and reproducible state.
  </Card>
  <Card title="Update and rebuild" href="/guides/plugins/update-and-rebuild" icon="fa-right-left">
    Check for updates, review changes, and reproduce the locked runtime.
  </Card>
  <Card title="Publish a plugin" href="/guides/plugins/publish" icon="fa-play">
    Create an open-source manifest, authenticate, and publish a release.
  </Card>
</CardGroup>

## Quick answers

<Accordion title="How do I add WASI?" open>

```sh
wago init --run
wago add wago-org/wasi
```

Wago resolves the package, asks you to review its capabilities, locks it, and rebuilds the runtime. See [Install and choose scope](/guides/plugins/install-and-scope).

</Accordion>

<Accordion title="What should I commit?">

Commit both `wago.json` and `wago-lock.json`. The manifest records intent; the lockfile records the exact version, approved authority, budgets, and plugin configuration. See [Grants and lockfiles](/guides/plugins/grants-and-lockfiles).

</Accordion>

<Accordion title="Are plugin grants a sandbox?">

No. They control access to privileged Wago APIs. Plugins remain native Go dependencies and must be audited. Guest `Policy` is a separate layer. See [Grants and lockfiles](/guides/plugins/grants-and-lockfiles).

</Accordion>

Browse published packages at [plugins.wago.sh](https://plugins.wago.sh).
