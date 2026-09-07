---
description: Initialize, review, authenticate, and publish an open-source Wago plugin package.
---

# Publish a Wago plugin

Package a reusable Wago plugin, preview exactly what will ship, then publish it to the public plugin registry.

New plugin authors should finish [Write your first plugin](/guides/plugins/authoring/first-plugin) and [Test a plugin](/guides/plugins/authoring/testing) before tagging a release.

Publishing requires a public GitHub repository and a Wago registry account. The dry run works before login.

## Prepare the plugin

```sh
wago init --plugin
```

Skip this command if the plugin already exists. The wizard collects the package metadata and creates the release files.

A publishable manifest points to public source and keeps discovery metadata under `package`. Wago plugins are open source.

Declare every privileged Wago integration as an exact Authority with a human
reason and enforceable scope. Declare package requirements separately from
typed, major-versioned Contracts. Provider catalogs return values from
`Providers()`; they never self-register from `init`.

## 1. Sign in

```sh
wago auth login
```

## 2. Refresh the catalog

```sh
wago plugin catalog
```

Run the plugin tests. Then check that no definition changed during the test run:

```sh
wago plugin catalog --check
```

## 3. Commit and tag

```sh
git add wago.json wago.providers.json register
git commit -m "Prepare plugin v0.1.0"
```

Tag that commit and push it:

```sh
git tag v0.1.0
git push origin HEAD v0.1.0
```

The version in the tag, manifest, and definitions must match.

## 4. Preview publication

```sh
wago plugin publish --dry-run
```

## 5. Publish

```sh
wago plugin publish
```

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
