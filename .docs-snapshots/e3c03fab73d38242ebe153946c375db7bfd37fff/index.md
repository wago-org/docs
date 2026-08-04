---
description: A wonderfully quick, compact, and extensible WebAssembly runtime for Go
---

# Wago documentation

A wonderfully quick, compact, and extensible WebAssembly runtime for Go

Use these guides to run WebAssembly from the command line, embed Wago in Go, and extend the runtime with plugins.

## Start here

<CardGroup>
  <Card title="Get started" href="/getting-started" icon="→">
    Install Wago, choose a release channel, and run your first module.
  </Card>
  <Card title="Configuration" href="/reference/configuration" icon="⚙">
    Learn how Wago projects and runtime options are configured.
  </Card>
  <Card title="Plugin registry" href="https://plugins.wago.sh/" icon="✦">
    Discover WASI, workers, pools, and other runtime extensions.
  </Card>
  <Card title="Documentation components" href="/components" icon="◇">
    Browse the reusable components available to documentation authors.
  </Card>
</CardGroup>

## Choose your channel

<Tabs sync="release-channel">
  <Tab title="Canary">

<Badge tone="pink">bleeding edge</Badge>

Built from the most recent successful CI run on `main`. Best for testing upcoming changes.

```sh
wago version install canary
```

  </Tab>
  <Tab title="Nightly">

<Badge tone="muted">daily</Badge>

The latest successful nightly release, useful for early access with a steadier cadence.

```sh
wago version install nightly
```

  </Tab>
  <Tab title="Official">

<Badge tone="green">recommended</Badge>

Pinned releases are the safest choice when reproducibility matters.

```sh
wago version install 0.0.0
```

  </Tab>
</Tabs>
