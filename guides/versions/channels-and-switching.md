---
description: Choose a Wago stable, nightly, canary, or commit runtime and switch between installed versions.
---

# Channels and switching

## Choose a channel

| Channel | Represents | Good fit |
|---|---|---|
| Stable | Named immutable release | Production and repeatable builds |
| Nightly | Rolling published snapshot | Recent integrated work |
| Canary | Latest build from `main` | Newest fixes and experiments |
| Commit | Exact source revision | Reproduction and bisecting |

Rolling channels move. Record the exact resolved version when a result must remain reproducible.

## Install a runtime

Interactive:

```sh
wago version install
```

Explicit:

```sh
wago version install --latest --use --no-input
wago version install --nightly --use --no-input
wago version install --canary --use --no-input
wago version install --version <commit> --use --no-input
```

Use `--no-use` when the new installation should not become active.

## Switch runtimes

```sh
wago version list
wago version switch
wago version switch canary
wago version switch v0.1.0
```

If the requested runtime is missing, `switch` installs it first.

Inspect the exact selection:

```sh
wago version current
wago version which
wago status
```

## Recover a known-good version

```sh
wago version switch v0.1.0
wago status
```

The project and modules stay in place. Only the selected runtime changes.

## Next

- [Choose a profile and build](/guides/versions/profiles-and-builds)
- [Automate updates and pin CI](/guides/versions/updates-and-automation)
- [Return to Release channels](/guides/version-channels)
