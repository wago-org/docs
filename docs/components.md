# Documentation components

Reusable components for clear, interactive Wago documentation. All components support keyboard navigation and narrow screens.

## Tabbed code examples

Use VitePress's built-in code groups for examples in multiple languages or formats.

::: code-group

```go [Go]
engine := wago.NewEngine()
module, err := engine.Compile(wasm)
if err != nil {
    return err
}
```

```wat [WAT]
(module
  (func (export "answer") (result i32)
    i32.const 42))
```

```sh [CLI]
wago run module.wasm
```

:::

## Tabbed sections

<Tabs sync="workflow">
  <Tab title="Compile">

Compile a module once when it will be instantiated more than once.

```go
module, err := engine.Compile(wasm)
```

  </Tab>
  <Tab title="Instantiate">

Create an isolated instance from the compiled module.

```go
instance, err := module.Instantiate(ctx)
```

  </Tab>
  <Tab title="Run">

Call an exported WebAssembly function.

```go
results, err := instance.Call(ctx, "answer")
```

  </Tab>
</Tabs>

Tabs with the same `sync` value remember the reader's choice and stay synchronized across the site.

## Cards

<CardGroup>
  <Card title="Get started" href="/getting-started" icon="→">
    Install Wago and run your first module.
  </Card>
  <Card title="Configuration" href="/reference/configuration" icon="⚙">
    Learn the available project settings.
  </Card>
  <Card title="Plugin registry" href="https://plugins.wago.sh/" icon="✦">
    Discover runtime extensions and integrations.
  </Card>
  <Card title="Source code" href="https://github.com/wago-org/wago" icon="⌘">
    Read Wago's implementation on GitHub.
  </Card>
</CardGroup>

## Steps

<Steps>
  <Step title="Install Wago">

```sh
curl -fsSL https://wago.sh/install.sh | sh
```

  </Step>
  <Step title="Compile a module">

Point Wago at a WebAssembly binary or WAT source file.

  </Step>
  <Step title="Run it">

Execute the module and inspect its result.

  </Step>
</Steps>

## Status badges

<Badge tone="green">stable</Badge>
<Badge>experimental</Badge>
<Badge tone="pink">deprecated</Badge>
<Badge tone="muted">nightly</Badge>

## Accordions

<Accordion title="What is compiled once?">

The validated module and native machine code can be reused by multiple isolated instances.

</Accordion>

<Accordion title="Does Wago require cgo?">

No. Wago is implemented in pure Go.

</Accordion>

## API endpoints

<ApiEndpoint method="GET" path="/api/packages">
List published plugins.
</ApiEndpoint>

<ApiEndpoint method="POST" path="/api/packages/{name}/installs">
Record a completed plugin installation.
</ApiEndpoint>

## Comparisons

<ComparisonTable :columns="['Canary', 'Nightly', 'Official']">
  <ComparisonRow feature="Cadence" :values="['Successful CI', 'Daily', 'Pinned']" />
  <ComparisonRow feature="Stability" :values="['Experimental', 'Preview', 'Stable']" />
  <ComparisonRow feature="Best for" :values="['Testing', 'Early access', 'Production']" />
</ComparisonTable>

## File trees

<FileTree>
  <FileTreeItem name="docs/" type="folder">
    <FileTreeItem name=".vitepress/" type="folder" comment="site configuration and theme">
      <FileTreeItem name="config.mts" comment="navigation and search" />
      <FileTreeItem name="theme/" type="folder" comment="Wago components" />
    </FileTreeItem>
    <FileTreeItem name="getting-started.md" />
    <FileTreeItem name="reference/" type="folder" />
  </FileTreeItem>
</FileTree>

## Code annotations

```wat
(module
  (func (export "answer") (result i32)
    i32.const 42))
```

<Annotations>
  <Annotation title="Exported function">
    The `answer` export is available to the host by name.
  </Annotation>
  <Annotation title="Typed result">
    The function returns one 32-bit integer.
  </Annotation>
  <Annotation title="Instruction body">
    `i32.const` places the value `42` on the operand stack.
  </Annotation>
</Annotations>
