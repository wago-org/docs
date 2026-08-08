---
description: Initialize, review, authenticate, and publish an open-source Wago plugin package.
---

# Publish a Wago plugin

Package a reusable Wago extension, preview exactly what will ship, then publish it to the public plugin registry.

Publishing requires a public GitHub repository and a Wago registry account. The dry run works before login.

## Create the manifest

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

A publishable manifest points to public source and includes an SPDX license. Wago plugins are deliberately open source.

## Authenticate

```sh
wago auth login
wago auth whoami
```

## Preview and publish

```sh
wago plugin publish --dry-run --json
wago plugin publish
```

Publishing uses `wago.json` and Git `HEAD` by default. Flags can override the manifest, commit, release notes, category, and tags.
