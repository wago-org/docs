---
description: Check for Wago plugin updates, review resolution changes, and reproduce a plugin runtime from its lockfile.
---

# Update, remove, and rebuild plugins

Check before changing anything, review the new resolution, and reproduce the selected runtime from committed lockfile state.

## Check without changing anything

```sh
wago plugin outdated
```

This reports newer releases without changing the manifest, lockfile, or runtime.

## Update one plugin

```sh
wago plugin update github.com/wago-org/wasi
```

Update the selected scope:

```sh
wago plugin update
```

Review the resulting `wago.json` and `wago-lock.json` diff before committing it.
A version change can alter transitive resolution, native code, requested
Authorities, configuration schema, or Contract bindings. Wago re-prompts only
for new or widened authority; an existing grant is preserved only when it still
fits the new request.

## Rebuild from the lockfile

```sh
wago plugin rebuild
```

This reproduces the selected plugin-enabled runtime from exact locked versions,
checksums, release fingerprints, provider catalogs, definition digests, grants,
configuration, and Contract bindings.

For a final prepared build:

```sh
wago plugin rebuild --locked --offline
```

Locked mode refuses manifest or lockfile mutation. Offline mode uses only local modules and caches.

## Preview mutations

```sh
wago plugin update --dry-run --json
```

Use a networked preparation step to resolve and review changes, then use locked and offline mode for the final build.

## Remove a plugin

```sh
wago rm github.com/wago-org/wasi
```

This is the short form of `wago plugin remove`. Removing a direct requirement
also prunes transitive plugins no longer reachable from another direct root. If
that changes an optional or `many` Contract binding, Wago asks you to review the
exact provider change. Non-interactive jobs must opt in explicitly:

```sh
wago plugin remove github.com/wago-org/wasi --accept-contracts --no-input
```
