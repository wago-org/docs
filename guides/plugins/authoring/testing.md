---
description: Test a Wago plugin's Go code, registration plan, provider catalog, lifecycle, and clean installation.
---

# Test a plugin

Test one boundary at a time. Most plugin mistakes appear before a Wasm module runs.

## Test ordinary Go code

```sh
go test ./...
```

Keep parsing, state, and service logic outside `Register`. Then those parts need no Wago test setup.

If callbacks share state, run:

```sh
go test -race ./...
```

## Test registration

Build a `PluginSet` with the same definition, grants, configuration, dependencies, and Contract bindings a consumer will review. Then validate it:

```go
if err := wago.ValidatePluginSet(reviewedSet()); err != nil {
	t.Fatal(err)
}
```

Add a case for each optional Authority you can run without. Add a scope-boundary case for modules or instance budgets.

The runnable examples use [examples/internal/exampleplugin](https://github.com/wago-org/wago/tree/main/examples/internal/exampleplugin) to keep this setup out of each `main.go`. That is a Go `internal` package and cannot be imported by an external plugin module. Use the explicit `PluginSet` from [the first-plugin integration test](./first-plugin#call-it-from-wasm) in your own module.

## Execute a guest

A catalog test can pass while `Register` still fails. Include a small Wasm fixture that imports the plugin's function, load the reviewed `PluginSet`, instantiate the guest, and check its return value. [Write your first plugin](./first-plugin#call-it-from-wasm) includes a complete test.

A selection for a standalone provider needs `Direct: true`; dependency-only providers must be reachable from a reviewed direct root. A digest and grant alone do not make a provider reachable.

## Check the catalog

After changing a definition, refresh its snapshot:

```sh
wago plugin catalog
```

CI should only check for drift:

```sh
wago plugin catalog --check
```

Commit `wago.providers.json` with the code it describes.

## Test shutdown

For a plugin with lifecycle work, cover:

- normal `Start` and `Stop`;
- a partially completed `Start`;
- cancellation during startup;
- an active callback during close; and
- release of every plugin-owned resource.

Use a deadline for tests that wait on goroutines.

## Try the consumer path

First [publish a release of your own plugin](../publish). The `github.com/acme/wago-answer` name below is a placeholder, not a published package; replace it with your real module path. Publishing and registry submission are separate from the local authoring checks above.

After your release is available, use a new directory:

```sh
mkdir consumer-test
cd consumer-test
wago init --run
```

Add the plugin interactively:

```sh
wago add github.com/acme/wago-answer
```

Read the review Wago shows, run a small guest, and rebuild once from the lockfile:

```sh
wago plugin rebuild --locked
```

Run the guest again after rebuilding. Also test configuration changes with a real load: `wago plugin config` may successfully rebuild a configuration that the provider rejects at startup.

A clean directory catches missing release files and accidental module-cache dependencies. An unpublished local provider should use Go tests or a Go host that links its provider directly; the public install path requires a published release.
