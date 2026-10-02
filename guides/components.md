---
description: Invoke a typed Component Model export from Go and run a WASI Preview 2 command through a scoped service lease.
---

# Run a WebAssembly component

A component can connect core Wasm modules behind typed interfaces. Wago's optional [Component Model plugin](https://github.com/wago-org/component-model) handles that graph and the Canonical ABI. The [WASI plugin](https://github.com/wago-org/wasi) supplies Preview 2 command policy and host interfaces.

This guide runs a small component from Go, then uses the same service to run a Preview 2 command. You need Go 1.22 or newer on a supported Wago host.

::: info Choose the execution path
The current `wago run` command accepts core Wasm modules. Adding the Component Model or WASI `/p2` provider does not make it a component-command runner. Passing a component binary to it reports `bad version at offset 4`.

Use the typed Go service below for components. Use [WASI Preview 1](./wasi) when you need the existing CLI command path.
:::

## Run the complete example

The [walkthrough fixture](https://github.com/wago-org/docs/tree/main/demos/fixtures/plugins-walkthrough/components) includes the complete host, explicit provider selections, and pinned Go dependencies.

Clone the docs and enter the fixture:

```sh
git clone https://github.com/wago-org/docs.git
cd docs/demos/fixtures/plugins-walkthrough/components
go mod download
```

Download the Component Model repository's small adder fixture:

```sh
curl -fsSL https://raw.githubusercontent.com/wago-org/component-model/d96ac8770288d303ebdfc8b84732ba553236aea4/testdata/adder.wasm -o adder.wasm
go run . add adder.wasm
```

Expected output:

```text
add(2, 3) = 5
```

The guest is already compiled. You do not need Rust, `wasm-tools`, or another guest compiler to run it.

## Declare the service you need

The host acts as a small consumer plugin. Its definition has both a package dependency and a typed Contract requirement:

```go
Requires: []wago.PluginRequirement{{
    ID: component.PluginID, Version: "^0.1.0",
}},
Consumes: []wago.ContractRequirement{{
    ID: component.Contract.ID(),
    Major: component.Contract.Major(),
    Mode: wago.ContractRequired,
}},
```

The package selects an implementation. The Contract identifies its typed service. The reviewed `PluginSet` must select both providers, mark the consumer as a direct root, and bind that exact Contract to the Component Model provider. The fixture shows all three pieces; a definition alone does not activate the graph.

During registration, obtain the reference:

```go
func (p *consumer) Register(reg *wago.Registrar) error {
    var err error
    p.components, err = plugin.Require(reg, component.Contract)
    return err
}
```

Here, `p.components` has type `*plugin.Ref[component.Service]`.

## Call a typed export

Use the service inside its lease, then use the component instance inside its own callback:

```go
err := host.components.With(func(service component.Service) error {
    return service.WithInstance(ctx, wasm, func(in *component.Instance) error {
        values, err := in.CallExport(
            ctx, "component:adder/calc", "add", uint32(2), uint32(3),
        )
        if err != nil {
            return err
        }
        fmt.Println(values[0])
        return nil
    })
})
```

The interface, function, and value types must match the component's exports. This adder takes two WIT `u32` values, so the Go arguments are `uint32`.

`WithInstance` closes the complete component graph before returning. Do not retain the instance outside that callback. Do not retain the service outside `Ref.With`. Close component callbacks and caches before closing the Wago runtime.

## Run a Preview 2 command

The same fixture has a `wasi` mode. Download the WASI repository's compiled Rust smoke command:

```sh
curl -fsSL https://raw.githubusercontent.com/wago-org/wasi/397f6e142b4d2d3fca0a59b9f3f56c9326478041/p2/testdata/rust_smoke.component.wasm -o command.component.wasm
printf 'from-component-stdin\n' | go run . wasi command.component.wasm alpha beta
```

The command prints its arguments, the explicitly supplied environment value, its stdin, and checks for a working clock and random-seeded map. It also writes `rust-wasip2-stderr` to stderr.

Inside the fixture, this path calls `p2.Run` with the leased Component Model service:

```go
return p2.Run(ctx, service, wasm, p2.Config{
    Stdin:  p2.NewInputStream(os.Stdin),
    Stdout: p2.NewOutputStream(os.Stdout),
    Stderr: p2.NewOutputStream(os.Stderr),
    Args:   []string{"command.component.wasm", "alpha", "beta"},
    Env:    []string{"WAGO_FLAVOR=docs"},
})
```

`Args` is the complete argument vector, including `argv[0]`. Ordinary Go readers and writers need `NewInputStream` and `NewOutputStream` adapters. The runner locates the versioned `wasi:cli/run` export and closes its adapter graph on return.

For a plugin whose configuration should come from Wago's reviewed lock graph, select `github.com/wago-org/wasi/p2` and consume `p2.Contract` instead. Its `p2.Service.Run(ctx, wasm)` uses the provider's selected configuration. That path also requires the Component Model dependency and both exact Contract bindings.

Preview 2 starts with an empty environment and no filesystem mounts. Its socket and name-lookup imports return typed `access-denied` results while networking is disabled. Use explicit `Mounts` when a command needs files. The [WASI guide](./wasi#grant-a-directory) explains the rights model.

## Review resource limits

The Component Model provider requests three required Authorities:

- `core.module.compile` to compile embedded core modules;
- `core.instance.instantiate` to own their bounded instance graph; and
- `core.funcref.create` to link Canonical ABI bridges.

Review the positive instance and aggregate memory limits shown for the exact selected release. A component may contain several core modules, and memoryless shims still use instance slots. Memory accounting uses declared maximum memory, or Wago's implementation reservation when a module declares no maximum. The charged budget can exceed the guest's currently used memory.

If a component exceeds the reviewed limit, it fails. Inspect its graph and choose an appropriate bounded grant; do not grant arbitrary limits as a first debugging step. These Authorities govern Wago APIs, while the plugin itself remains trusted native Go code.

## Add your own host interface

Use `component.WithImport` for a synchronous typed host function. This example returns its string argument:

```go
stringType := component.PrimitiveDesc{Prim: "string"}
echo := component.WithImport(
    "example:host/echo@1.0.0",
    "echo",
    func(ctx context.Context, args []component.Value) ([]component.Value, error) {
        return []component.Value{args[0]}, nil
    },
    []component.TypeDesc{stringType},
    []component.TypeDesc{stringType},
)
```

Pass `echo` after the callback to `service.WithInstance(ctx, wasm, useInstance, echo)`. Match the component's imported interface version and function signature exactly.

For composite types, resources, caches, and experimental async APIs, continue with the [provider's public API and tests](https://github.com/wago-org/component-model). For the underlying dependency lifecycle, read [Contracts and dependencies](./plugins/authoring/contracts).
