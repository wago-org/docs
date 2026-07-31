---
description: Configure projects and reproducible plugin lockfiles with the Wago nightly runtime channel.
---

# Configuration

Nightly uses the same schema-backed project format as the current official release while previewing runtime and tooling changes.

::: warning Preview channel
Review changes before carrying a nightly-generated lockfile back to a project pinned to an official release.
:::

```json
{
  "$schema": "https://wago.sh/v0/schema.json",
  "plugins": {
    "wago-org/wasi": "^0.0.0"
  }
}
```

<Steps>
  <Step title="Initialize">

```sh
wago init --quick
```

  </Step>
  <Step title="Add a plugin">

```sh
wago add wago-org/wasi
```

  </Step>
  <Step title="Verify the resolution">

```sh
wago plugin check
wago plugin plan
```

  </Step>
</Steps>

`wago.json` records version constraints and project intent. Commit the generated `wago-lock.json` as the exact source of plugin versions, reviewed capabilities, and configuration.
