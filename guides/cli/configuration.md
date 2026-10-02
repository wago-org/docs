---
description: Choose Wago runtime profiles, pin a revision, and keep project and user defaults separate.
---

# Configure and manage Wago

The `wago` command is a manager. The runtime it selects does the actual Wasm
work. Updating one does not automatically mean you changed the other.

## Know what is running

```sh
wago --version
wago version current
wago version which
wago status
```

`--version` shows the runtime release, platform, toolchain, and manager.
`version current` shows the selected channel or version plus its profile and
build; a channel name alone is not an exact revision. `version which` prints the
executable path. `status` also shows the project and plugin lockfile.

Copy `wago --version` output when reporting a bug.

## Pick a channel

Install the latest beta without prompts:

```sh
wago version install --beta --profile standard --build normal --use --no-input
```

Or switch to a development build:

```sh
wago version switch canary --profile standard --build normal
```

Switching installs a missing runtime. `beta` and `canary` move over time. Once a
release or commit works for your project, use its exact tag or commit in scripts:

```sh
wago version install --version <tag-or-commit> --profile standard --build normal --use --no-input
```

Replace `<tag-or-commit>` with the revision you tested. A commit build may need
Git, Go, and network access; it is not a promise that a release asset exists.
Go applications should pin their Wago dependency in `go.mod` too.

## Choose a profile and build

Start with `standard/normal` unless you have a reason to change it.

| Choice | What it means |
|---|---|
| `--profile standard` | Full runtime command surface |
| `--profile minimal` | Smaller, run-only runtime; do inspection and compilation with standard |
| `--build normal` | Built with the standard Go compiler |
| `--build tiny` | Built with TinyGo; availability depends on the version and target |

For example:

```sh
wago version install --beta --profile minimal --build normal --use --no-input
```

These switches choose the installed runtime. `wago compile --tinygo` separately
chooses the linker for a [standalone executable](./standalone).

## Save defaults where they belong

Inside a project:

```sh
wago init --run --yes --no-input
wago config set optimizations.inline off --local
wago config diff --local
wago config reset optimizations.inline --local
```

Reset removes the local override and restores inheritance. Use `--global` for
user-wide settings; a command flag overrides both. See
[Configuration](../../reference/configuration) for the complete precedence and
manifest format.

## Update deliberately

Preview a coordinated manager, runtime, and plugin update before applying it:

```sh
wago update --all --dry-run --json
wago update --all
```

Run your module's smoke test after updating. Keep the Wasm source for any
precompiled `.wago` files so you can rebuild them when the artifact format
changes. Commit project manifests and plugin lockfiles together.

## Add shell completion

```sh
wago config completions zsh --install --dry-run
wago config completions zsh --install
```

Replace `zsh` with `bash` or `fish`. The preview shows the planned change before
you modify shell startup files.
