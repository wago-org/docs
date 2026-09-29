---
description: Configure CLI defaults and select, update, or pin Wago runtimes.
---

# Configure and manage Wago

Command flags affect one run. Save only defaults you expect to reuse.

## Save configuration

Inspect overrides, then set or remove the smallest required value:

```sh
wago config diff --local
wago config set optimizations.inline off --local
wago config reset optimizations.inline --local
```

Use `--global` for user-wide defaults. Project settings live in `wago.json`; create it with `wago init --run`.

## Install completions

```sh
wago config completions zsh --install
```

Replace `zsh` with `bash` or `fish`. Use `--dry-run` to preview the change.

## Select a runtime

Switch to beta, canary, or an exact tested commit:

```sh
wago version switch beta
wago version switch canary
wago version install --version <commit> --use --no-input
```

Use `wago version current` to record the exact selection. Rolling channels move.

## Choose a build

`standard` is the complete profile; `minimal` is run-only. `normal` uses standard Go; `tiny` uses TinyGo.

```sh
wago version install --canary --profile minimal --build tiny --use
```

## Update

Preview coordinated updates before applying them:

```sh
wago update --all --dry-run --json
wago update --all
```

In CI, install an exact commit with `--no-input` instead of following a rolling channel.
