# Getting started

Install the Wago manager, select a runtime channel, and run a small WebAssembly module.

::: tip Prerequisite
The source installer requires Go 1.22 or newer. It prefers Git and can fall back to a GitHub source archive when necessary.
:::

<Steps>
  <Step title="Install the manager">

```sh
curl -fsSL https://wago.sh/install.sh | sh
```

The interactive installer defaults to `~/.wago/bin` and can add that directory to your shell path.

  </Step>
  <Step title="Choose a runtime">

Your channel preference is shared with other channel tabs across the documentation.

<Tabs sync="release-channel">
  <Tab title="Canary">

```sh
wago version install canary
```

  </Tab>
  <Tab title="Nightly">

```sh
wago version install nightly
```

  </Tab>
  <Tab title="Official">

```sh
wago version install 0.0.0
```

  </Tab>
</Tabs>

  </Step>
  <Step title="Download a small module">

```sh
curl -LO https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm
```

  </Step>
  <Step title="Run it">

```sh
wago run fib.wasm 30
```

`run` validates and compiles the module before invoking the exported function.

  </Step>
</Steps>

## What was installed?

On macOS, Wago uses the following default layout. Linux uses the corresponding XDG data, config, and cache directories; `WAGO_HOME` can override both layouts.

<FileTree>
  <FileTreeItem name="~/.wago/" type="folder">
    <FileTreeItem name="bin/" type="folder" comment="runtime-independent manager" />
    <FileTreeItem name="versions/" type="folder" comment="installed runtime channels and releases" />
  </FileTreeItem>
</FileTree>

## Next steps

<CardGroup>
  <Card title="Configure a project" href="/reference/configuration" icon="⚙">
    Add project-level settings and runtime options.
  </Card>
  <Card title="Browse plugins" href="https://plugins.wago.sh/" icon="✦">
    Extend Wago with host integrations and runtime services.
  </Card>
</CardGroup>
