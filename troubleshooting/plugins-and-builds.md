---
description: Diagnose Wago plugin resolution, capability grants, lockfiles, offline mode, and standalone builds.
---

# Plugins and builds

## Inspect plugin state

```sh
wago status
wago plugin tree
wago plugin inspect
```

Then identify the failing stage:

- `wago plugin outdated` checks for newer releases.
- `wago plugin grant <name>` edits authority.
- `wago plugin rebuild` reproduces locked versions.
- `wago plugin update <name>` changes resolution and rebuilds.

Use `--verbose` when the underlying Go build diagnostic matters.

## Locked mode fails

The operation would need to change `wago.json` or `wago-lock.json`. Preview it outside the final build:

```sh
wago plugin update --dry-run --json
```

Review and commit the result, then retry locked mode.

## Offline mode fails

A required module or artifact is missing locally. Fetch it during an intentional networked preparation step, then run the final build offline.

## Standalone compilation fails

Preview the plan:

```sh
wago compile module.wasm --dry-run --json
```

Check that:

- `_start` exists or `--invoke` names a real export;
- the target is Darwin, Linux, or Windows on AMD64 or ARM64;
- required plugins are selected;
- dependencies exist locally when offline mode is enabled;
- plugins support the target.

Show the Go build output:

```sh
wago compile module.wasm --verbose -o module
```

## Next

- [Update and rebuild plugins](/guides/plugins/update-and-rebuild)
- [Choose standalone artifacts](/guides/run/artifacts)
- [Return to Troubleshooting](/troubleshooting)
