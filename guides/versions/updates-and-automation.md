---
description: Update Wago components, pin runtime selection in CI, and clean old runtime data safely.
---

# Updates and automation

## Update a rolling channel

```sh
wago version update canary
wago version update nightly
```

Use `--no-use` to refresh without switching and `--force` to reinstall a matching commit after a damaged cache or interrupted installation.

## Update selected components

```sh
wago update
wago update --manager
wago update --runtime
wago update --plugins
wago update --all
```

Preview coordinated changes:

```sh
wago update --all --dry-run --json
```

## Pin CI

```sh
wago version install --version v0.1.0 \
  --profile standard \
  --build normal \
  --use \
  --no-input

wago version current
wago status --json
```

A channel name is not a pin. Use an exact stable release or commit when a build must remain repeatable.

## Shared automation flags

- `--no-input` never prompts.
- `--dry-run` shows a supported mutation plan.
- `--json` emits machine-readable output where supported.
- `--locked` refuses manifest or lockfile changes.
- `--offline` uses installed and cached resources only.

## Remove old data

```sh
wago version uninstall v0.0.9 v0.0.10
wago cache size
wago cache prune
```

Use `wago cache clean` for intentional regeneration and `wago cache dir` to inspect the location first.

## Next

- [Configure hermetic automation](/reference/configuration/automation-and-go)
- [Rebuild locked plugins](/guides/plugins/update-and-rebuild)
- [Return to Release channels](/guides/version-channels)
