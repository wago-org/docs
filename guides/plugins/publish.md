---
description: Initialize, review, authenticate, and publish an open-source Wago plugin package.
---

# Publish a plugin

## Create the manifest

```sh
wago init --plugin
```

For non-interactive setup:

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

## Package requirements

The Go code supplies an `Extension` with stable identity, version, compatibility, capability declarations, and registration behavior. Registration is transactional: a failure must not leave half a plugin active.

The manifest supplies registry metadata, public provenance, compatible toolchain ranges, platform targets, and optional subpackages.

<Accordion title="How is the version selected?">

Use the manifest's semantic `version`. When omitted, publishing falls back to the newest Git tag.

</Accordion>

<Accordion title="Can I publish a private plugin?">

The public registry requires open source. Application-owned private integrations can still register an `Extension` directly in Go without publishing it.

</Accordion>

## Next

- [Review plugin capabilities](/guides/plugins/grants-and-lockfiles)
- [Configure publish metadata](/reference/configuration/project-manifest)
- [Browse the registry](https://plugins.wago.sh)
