---
description: Choose a Wago nightly, canary, or exact-commit runtime and switch between installed versions.
---

# Choose and switch release channels

Pick how fresh or repeatable the runtime should be, install that channel, and switch without replacing your other installed versions.

## Choose a channel

| Channel | Represents | Good fit |
|---|---|---|
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
wago version install --nightly --use --no-input
wago version install --canary --use --no-input
wago version install --version 4c28f4a32e67 --use --no-input
```

Use `--no-use` when the new installation should not become active.

## Switch runtimes

```sh
wago version list
wago version switch
wago version switch canary
```

If the requested runtime is missing, `switch` installs it first.

Inspect the exact selection:

```sh
wago version current
wago version which
wago status
```

## Use a known-good commit

```sh
wago version install --version 4c28f4a32e67 --use --no-input
wago status
```

The project and modules stay in place. Only the selected runtime changes. The SHA above is a real example; use the commit you tested.
