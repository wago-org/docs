---
description: Run with the plugin, review updates, and reproduce its runtime from the lockfile.
---

# Run and maintain the plugin

Wago finds the nearest `wago.json` and uses its generated runtime automatically. Run your module:

```sh
wago run module.wasm
```

If the module still reports a missing import, compare `wago module imports module.wasm` with `wago plugins list` and return to the plugin review.

## Check for updates

```sh
wago plugin outdated
```

This does not change the project. To update the selected plugin graph:

```sh
wago plugin update
```

Follow the same interactive review used during installation. Wago asks again when an update adds or widens access or changes Contract bindings. Review the `wago.json` and `wago-lock.json` diff before committing it.

## Rebuild from the lockfile

```sh
wago plugin rebuild
```

This rebuilds the runtime from the exact versions, checksums, grants, configuration, and Contract bindings in `wago-lock.json`.

## Remove a plugin

```sh
wago rm JairusSW/wide
```

Wago removes transitive dependencies that nothing else needs and asks you to review changed Contract bindings.

The project is now portable: commit `wago.json` and `wago-lock.json`, then run `wago plugin rebuild` after cloning it elsewhere. See [Automation and Go](../../reference/configuration/automation-and-go) for non-interactive CI checks, or the [Plugin FAQ](./faq) for scopes, configuration, and troubleshooting.
