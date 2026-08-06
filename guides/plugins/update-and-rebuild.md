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
wago plugin update wago-org/wasi
```

Update the selected scope:

```sh
wago plugin update
```

Review the resulting `wago.json` and `wago-lock.json` diff before committing it. A version change can add native code or request new authority.

## Rebuild from the lockfile

```sh
wago plugin rebuild
```

This reproduces the selected plugin-enabled runtime from exact locked versions.

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
wago rm wago-org/wasi
```

This is the short form of `wago plugin remove`.
