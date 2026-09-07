---
description: Test a Wago plugin's Go code, registration plan, provider catalog, lifecycle, and clean installation.
---

# Test a plugin

Test one boundary at a time. Most plugin mistakes appear before a Wasm module runs.

## 1. Test ordinary Go code

```sh
go test ./...
```

Keep parsing, state, and service logic outside `Register`. Then those parts need no Wago test setup.

If callbacks share state, run:

```sh
go test -race ./...
```

## 2. Test registration

Build a `PluginSet` with the same definition, grants, configuration, dependencies, and Contract bindings a consumer will review. Then validate it:

```go
if err := wago.ValidatePluginSet(reviewedSet()); err != nil {
	t.Fatal(err)
}
```

Add a case for each optional Authority you can run without. Add a scope-boundary case for modules or instance budgets.

The runnable examples use [examples/internal/exampleplugin](https://github.com/wago-org/wago/tree/main/examples/internal/exampleplugin) to keep this setup out of each `main.go`.

## 3. Check the catalog

After changing a definition, refresh its snapshot:

```sh
wago plugin catalog
```

CI should only check for drift:

```sh
wago plugin catalog --check
```

Commit `wago.providers.json` with the code it describes.

## 4. Test shutdown

For a plugin with lifecycle work, cover:

- normal `Start` and `Stop`;
- a partially completed `Start`;
- cancellation during startup;
- an active callback during close; and
- release of every plugin-owned resource.

Use a deadline for tests that wait on goroutines.

## 5. Try the consumer path

Push a test version, then use a new directory:

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

A clean directory catches missing release files and accidental module-cache dependencies.
