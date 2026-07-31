---
description: Install the latest Wago nightly build and run a WebAssembly module with the preview runtime channel.
---

# Getting started

Install the most recent successful nightly build and run a small WebAssembly module.

<Steps>
  <Step title="Install Wago">

```sh
curl -fsSL https://wago.sh/install.sh | sh
wago version install nightly
```

  </Step>
  <Step title="Download the example">

```sh
curl -LO https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm
```

  </Step>
  <Step title="Run it">

```sh
wago run fib.wasm 30
```

  </Step>
</Steps>

::: tip Staying current
Run `wago version update nightly` to move to the newest successful nightly build. Matching commit hashes are left untouched unless you pass `--force`.
:::

<CardGroup>
  <Card title="Configure a project" href="/nightly/reference/configuration" icon="⚙">
    Add a schema-backed manifest and reproducible plugin lockfile.
  </Card>
  <Card title="Use the latest release" href="/v0.0.0/getting-started" icon="✓">
    Prefer the pinned official release for production work.
  </Card>
</CardGroup>
