---
description: Install the official Wago v0.0.0 release and run your first WebAssembly module.
---

# Getting started

Install the pinned v0.0.0 release and run a small WebAssembly module.

<Steps>
  <Step title="Install Wago">

```sh
curl -fsSL https://wago.sh/install.sh | sh
wago version install 0.0.0
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

<CardGroup>
  <Card title="Configure a project" href="/v0.0.0/reference/configuration" icon="⚙">
    Create a schema-backed manifest and reproducible plugin lockfile.
  </Card>
  <Card title="Try nightly" href="/nightly/getting-started" icon="◐">
    Preview the most recent successful nightly build.
  </Card>
</CardGroup>
