---
description: Update Wago components, pin runtime selection in CI, and clean old runtime data safely.
---

# Update and automate Wago installs

Refresh rolling channels, pin exact runtime selections in CI, and keep automated installs quiet and reproducible.

## Update a rolling channel

```sh
wago version update canary
wago version update nightly
```

Use `--no-use` to refresh without switching and `--force` to reinstall a matching commit after a damaged cache or interrupted installation.

## Update selected components

```sh
wago update --all
```

Preview coordinated changes:

```sh
wago update --all --dry-run --json
```

## Pin CI

```sh
wago version install --version 4c28f4a32e67 \
  --profile standard \
  --build normal \
  --use \
  --no-input

wago version current
wago status --json
```

A channel name is not a pin. The SHA above is a real example; pin the commit you tested.

## Remove old data

```sh
wago version list
wago version uninstall 4c28f4a32e67
wago cache size
wago cache prune --yes
```

Uninstall only versions you no longer need. Use `wago cache dir` to inspect the cache before removing anything.
