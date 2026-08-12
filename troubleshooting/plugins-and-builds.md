---
description: Diagnose Wago plugin resolution, Authority Grants, Contract bindings, lockfiles, offline mode, and standalone builds.
---

# Fix plugin resolution and standalone builds

Inspect the selected scope and resolved plugin graph before changing grants, lockfiles, offline mode, or compiler settings.

## Inspect plugin state

```sh
wago status
wago plugin tree
wago plugin list --json
wago plugin inspect github.com/wago-org/wasi
wago plugin rebuild --locked
```

Then identify the failing stage:

- If `wago.providers.json` is missing or stale, run `wago plugin catalog`,
  inspect the diff, and commit it before tagging. Use
  `wago plugin catalog --check` in CI.
- If publish reports an exact-source mismatch, the tagged module's
  `wago.json` or `wago.providers.json` differs from the local release. Move the
  version forward and create a new tag after committing both artifacts; do not
  reuse a published Go module version.
- `wago plugin outdated` checks for newer releases.
- `wago plugin grant github.com/wago-org/wasi` edits reviewed Authority scope.
- `wago plugin rebuild` reproduces locked versions.
- `wago plugin update github.com/wago-org/wasi` changes resolution and rebuilds.

Use `--verbose` when the underlying Go build diagnostic matters.

## Locked mode fails

The operation would need to change `wago.json` or `wago-lock.json`. Preview it outside the final build:

```sh
wago plugin update --dry-run --json
```

Review and commit the result, then retry locked mode.

Locked mode can also fail when a transitive edge, source checksum, release
fingerprint, provider catalog, definition digest, Authority Grant, configuration,
or Contract binding no longer matches the committed graph. The locked rebuild
identifies the exact field; do not hand-edit a digest or binding to silence it.

## Dependency resolution fails

The plan reports every constraint and the parent that contributed it. If no
global solution exists, update or remove the conflicting direct requirement
rather than forcing one transitive version. Wago backtracks across available
releases and prefers the highest deterministic complete solution, so a conflict
means the published ranges genuinely cannot be satisfied together.

A dependency or Contract cycle is invalid even when every individual range is
compatible. Break the package edge or move the shared behavior behind a lower
level Contract provider.

## Contract binding fails

Check the consumer's Contract ID, major, and mode against the selected provider:

```sh
wago plugin list --json
```

Required and optional Contracts accept at most one provider; `many` accepts the
complete deterministic provider list. A different major is deliberately
incompatible. Locked mode never silently chooses a replacement provider.

## An Authority is denied

Inspect the published request and current grant:

```sh
wago plugin inspect github.com/wago-org/workers
wago plugin grant github.com/wago-org/workers
```

A required Authority must remain present, but its scope can be narrowed. If the
plugin needs a withheld module or a larger minimum resource budget, registration
fails before commit and your previous runtime stays active. A grant cannot widen
the publisher's request.

## Offline mode fails

A required module or artifact is missing locally. Fetch it during an intentional networked preparation step, then run the final build offline.

## Standalone compilation fails

Preview the plan:

```sh
wago compile fib.wasm --invoke fib --dry-run --json
```

Check that:

- `_start` exists or `--invoke` names a real export;
- the target is Darwin, Linux, or Windows on AMD64 or ARM64;
- required plugins are selected;
- every required Contract has its locked provider;
- dependencies exist locally when offline mode is enabled;
- plugins support the target.

Show the Go build output:

```sh
wago compile fib.wasm --invoke fib --verbose -o fib
```
