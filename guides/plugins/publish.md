---
description: Initialize, review, authenticate, and publish an open-source Wago plugin package.
---

# Publish a Wago plugin

Package a reusable Wago plugin, preview exactly what will ship, then publish it to the public plugin registry.

Publishing requires a public GitHub repository and a Wago registry account. The dry run works before login.

## Scaffold the plugin

```sh
wago init --plugin \
  --module github.com/acme/wago-observability \
  --name "Wago Observability" \
  --description "Tracing hooks for Wago hosts." \
  --version 0.1.0 \
  --license Apache-2.0 \
  --repository https://github.com/acme/wago-observability \
  --yes
```

The scaffold creates a v1 manifest, one-method plugin, immutable
`PluginDefinition`, explicit `/register` catalog, canonical
`wago.providers.json`, and drift tests. A publishable manifest points to public source, includes an SPDX
license and structured author, and keeps discovery metadata under `package`.
Wago plugins are deliberately open source.

Declare every privileged Wago integration as an exact Authority with a human
reason and enforceable scope. Declare package requirements separately from
typed, major-versioned Contracts. Provider catalogs return values from
`Providers()`; they never self-register from `init`.

## Authenticate

```sh
wago auth login
wago auth whoami
```

## Snapshot, tag, and publish

```sh
wago plugin catalog
wago plugin catalog --check
git add wago.json wago.providers.json register
git commit -m "Prepare plugin v0.1.0"
git tag v0.1.0
git push origin HEAD v0.1.0
wago plugin publish --dry-run --json
wago plugin publish
```

`wago plugin catalog` executes the current checkout's explicit catalog and
writes its canonical, digest-bearing snapshot. Commit that file before tagging;
`--check` is the CI-friendly drift gate. The provider artifact uses
`https://wago.sh/v1/providers.schema.json`.

The publish dry run only prints the planned mutation. Actual publishing first
checks the local catalog against the committed snapshot, then downloads the
exact tagged Go module. Its `wago.json` package metadata and
`wago.providers.json` must match the local release, and its `h1:` checksum is
sent with the request. Local code runs only for the local drift check; Wago does
not execute code from the downloaded tag.

The registry independently downloads that same exact module and checksum, reads
both artifacts without executing plugin code, and rejects any mismatch.
Consumers later review the stored immutable definitions before plugin code is
downloaded or built; linked definitions must match their reviewed digests.
