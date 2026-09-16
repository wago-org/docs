---
description: Scaffold and test a Wago plugin that provides one host import to WebAssembly guests.
---

# Write your first plugin

This plugin adds `tutorial.answer() -> i32` and returns `42`.

You need Go 1.22 or newer and a standard Wago runtime.

## Start the wizard

```sh
mkdir wago-answer
cd wago-answer
wago init --plugin
```

Answer the prompts. The wizard writes the manifest, provider catalog, Go package, and first test.

::: info Canary dependency
If Go reports that `github.com/wago-org/wago@v0.1.0` does not exist yet, point the scaffold at current canary source:

```sh
go mod edit -droprequire github.com/wago-org/wago
go get github.com/wago-org/wago@main
```
:::

## Request one Authority

Open `register/register.go`. Add this request to the generated definition:

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

Inside `Register`, get the reviewed module:

```go
imports, err := reg.HostImports()
if err != nil {
	return err
}
```

Then add the function:

```go
imports.HostFunc("tutorial", "answer", func() int32 { return 42 })
return nil
```

Wago infers this function's no-parameter, one-`i32` signature.

## Check it

Format the file:

```sh
gofmt -w register/register.go
```

Refresh the published definition snapshot:

```sh
wago plugin catalog
```

Run the tests:

```sh
go test ./...
```

Check that the snapshot is current:

```sh
wago plugin catalog --check
```

![Generating and checking a Wago plugin catalog](/demos/plugin-authoring.gif)

The complete runnable version is [examples/08-custom-plugin](https://github.com/wago-org/wago/tree/main/examples/08-custom-plugin). Next, read [Definitions and providers](./definitions-and-providers).
