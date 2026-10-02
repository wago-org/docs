---
description: Scaffold, register, and execute a Wago plugin that provides one host import to a WebAssembly guest.
---

# Write your first plugin

This plugin adds `tutorial.answer() -> i32` and returns `42`. You will create its catalog, then test an actual guest call so registration errors cannot hide behind a passing metadata test.

You need Go 1.22 or newer on `PATH`, the Wago manager, and a standard runtime. Complete [Getting started](../../../getting-started) first, then check `wago --version`. The walkthrough works with the beta.11 manager and standard runtime; the Go dependency below is pinned separately.

## Start the wizard

```sh
mkdir wago-answer
cd wago-answer
wago init --plugin
```

Choose your public Go module path, name, description, version, license, repository, and author. Use a repository you control for a plugin you intend to publish. The wizard writes `wago.json`, `wago.providers.json`, `go.mod`, `register/register.go`, and a catalog test.

The complete [answer fixture](https://github.com/wago-org/docs/tree/c10fc427b008e71878e9cb890e2c609d0f008a8c/demos/fixtures/plugins-walkthrough/answer) uses `github.com/acme/wago-answer` as an example identity. It is local test code, not a package to install from that GitHub account.

::: info Canary dependency
The beta.11 scaffold writes `github.com/wago-org/wago v0.1.0`, which is not published. Replace it with the public canary revision used by this walkthrough before generating the catalog:

```sh
go mod edit -droprequire github.com/wago-org/wago
go get github.com/wago-org/wago@b084a7c9343f81a9120ca80a13d133884e88d514
```

Go records the exact pseudo-version in `go.mod`. Commit `go.mod` and `go.sum`; no local checkout or `replace` directive is needed. Use a newer revision only after rerunning the same tests.
:::

## Request one Authority

Open `register/register.go`. Add this field inside the generated `wago.PluginDefinition`:

```go
Authorities: []wago.AuthorityRequest{{
    Name:   wago.AuthorityHostImportDefine,
    Mode:   wago.AuthorityRequired,
    Reason: "define the tutorial guest API",
    Scope:  wago.AuthorityScope{Modules: []string{"tutorial"}},
}},
```

The scope covers the exact import module `tutorial`. It does not cover parent names or wildcards.

## Define the guest function

Replace the generated `Register` method with this complete method. Give its registrar parameter the name `reg`:

```go
func (plugin) Register(reg *wago.Registrar) error {
    imports, err := reg.HostImports()
    if err != nil {
        return err
    }
    imports.HostFunc("tutorial", "answer", func(call wago.HostCall) {
        call.SetI32(0, 42)
    }).Results(wago.ValI32)
    return nil
}
```

`HostCall` supplies the result slot. `.Results(wago.ValI32)` declares the guest signature. The current inferred-signature adapter does not accept `func() int32`, so use this portable form for the zero-argument result.

## Refresh and check the catalog

```sh
gofmt -w register/register.go
wago plugin catalog
go test ./...
wago plugin catalog --check
```

![Generating and checking a Wago plugin catalog](/demos/plugin-authoring.gif)

The generated test compares metadata with `wago.providers.json`. It does not load the plugin or execute its host function. Add the guest test next.

## Call it from Wasm

The guest imports the function and re-exports a wrapper:

```wat
(module
  (import "tutorial" "answer" (func $answer (result i32)))
  (func (export "run") (result i32)
    call $answer))
```

Download the matching precompiled guest into `testdata/answer.wasm`, or build that WAT with your usual guest tools:

```sh
mkdir -p testdata
curl -fsSL https://raw.githubusercontent.com/wago-org/wago/b084a7c9343f81a9120ca80a13d133884e88d514/examples/22-language-guests/wat/answer.wasm -o testdata/answer.wasm
```

Add `register/integration_test.go`:

```go
package register

import (
    "context"
    "os"
    "testing"

    wago "github.com/wago-org/wago"
)

func TestAnswerFromGuest(t *testing.T) {
    provider := Providers()[0]
    digest, err := wago.DefinitionDigest(provider.Definition)
    if err != nil { t.Fatal(err) }
    set := wago.PluginSet{
        Providers: []wago.PluginProvider{provider},
        Selections: []wago.PluginSelection{{
            ID: provider.Definition.ID,
            DefinitionDigest: digest,
            Direct: true,
            Grants: []wago.AuthorityGrant{{
                Name: wago.AuthorityHostImportDefine,
                Scope: wago.AuthorityScope{Modules: []string{"tutorial"}},
            }},
        }},
    }
    ctx := context.Background()
    rt := wago.NewRuntime()
    defer rt.Close()
    if err := rt.LoadPlugins(ctx, set); err != nil { t.Fatal(err) }
    wasm, err := os.ReadFile("../testdata/answer.wasm")
    if err != nil { t.Fatal(err) }
    mod, err := rt.Compile(wasm)
    if err != nil { t.Fatal(err) }
    defer mod.Close()
    in, err := rt.Instantiate(ctx, mod)
    if err != nil { t.Fatal(err) }
    defer in.Close()
    results, err := in.Invoke("run")
    if err != nil { t.Fatal(err) }
    if len(results) != 1 || wago.AsI32(results[0]) != 42 {
        t.Fatalf("run() = %v, want 42", results)
    }
}
```

This test explicitly grants the one reviewed Authority. `Direct: true` makes the provider a selected root. The test fails if the grant, callback, Wasm import, or result is wrong.

Run both checks:

```sh
gofmt -w register
go test ./... -v
wago plugin catalog --check
```

You should see `TestProviderCatalog` and `TestAnswerFromGuest` pass. These tests link the local provider directly. They do not install it into the `wago` CLI runtime; keep using the Go test until you publish and install your own package.

## Keep going

For a complete plugin with a guest capability and state, run [examples/08-custom-plugin](https://github.com/wago-org/wago/tree/main/examples/08-custom-plugin). You can run the published example without cloning Wago:

```sh
go run github.com/wago-org/wago/examples/08-custom-plugin@b084a7c9343f81a9120ca80a13d133884e88d514
```

Read [Definitions and providers](./definitions-and-providers) to grow this definition, then [Test a plugin](./testing) before publishing.
