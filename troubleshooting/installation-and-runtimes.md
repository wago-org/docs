---
description: Fix Wago PATH, missing runtime, wrong variant, cache, and stale precompiled artifact problems.
---

# Fix installation and runtime selection

Use this page when the shell cannot find Wago, no runtime is active, the wrong build is selected, or a cached artifact became stale.

## The shell cannot find `wago`

If installation finished moments ago, open a new terminal. Then locate the executable:

<Tabs sync="troubleshoot-os">
  <Tab title="macOS / Linux">

```sh
command -v wago
```

  </Tab>
  <Tab title="PowerShell">

```powershell
Get-Command wago
```

  </Tab>
  <Tab title="Command Prompt">

```cmd
where wago
```

  </Tab>
</Tabs>

If nothing appears, rerun the installer from [Getting started](../getting-started). If two paths appear, the first one wins; remove or reorder the stale entry.

## No runtime is active

The manager intentionally does not bundle one:

```sh
wago version install
wago version current
wago version which
```

Non-interactively:

```sh
wago version install --beta --profile standard --build normal --use --no-input
```

## The wrong variant is active

```sh
wago version switch canary --profile standard --build normal
```

`wago version current` reports the selected channel or version, profile, and
build. Use `wago --version` for the resolved release and toolchain.

## The installer is building from source

This can happen when the selected release asset or its checksum cannot be
fetched. It is slower than a binary download. Check that `go version` and
`git --version` work, and retain the complete error if the source build fails.
A successful manager install still needs a runtime selected afterward.

## Standard commands are missing

Check the profile in `wago --version`. The minimal runtime is run-only. Switch
to `standard/normal` for inspection, validation, and precompilation.
[Profiling](../guides/cli/profiling) requires a separate opt-in build.
Use the matching docs version and the installed command's `--help` when a flag
is missing.

## A `.wago` file stopped loading

Compiled artifacts are tied to Wago's format and the host architecture. Rebuild from the original Wasm:

```sh
wago build fib.wasm -o fib.wago
```

Distribute `.wasm` for portability or use `wago compile` for a target-specific standalone executable.

## Inspect and clean caches

```sh
wago cache dir
wago cache size
wago cache prune --yes
```

Use `wago cache clean` only when you intend to regenerate the selected data.
