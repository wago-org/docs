# Configuration

Wago v0.0.0 keeps project intent in `wago.json` and exact plugin resolution and authority in `wago-lock.json`.

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

::: tip Commit both files
`wago.json` contains semantic-version constraints. The generated lockfile contains exact versions, reviewed capability grants, and plugin-owned configuration.
:::
