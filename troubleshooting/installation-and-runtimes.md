---
description: Fix Wago PATH, missing runtime, wrong variant, cache, and stale precompiled artifact problems.
---

# Installation and runtimes

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

If nothing appears, rerun the installer from [Getting started](/getting-started). If two paths appear, the first one wins; remove or reorder the stale entry.

## No runtime is active

The manager intentionally does not bundle one:

```sh
wago version install
wago version current
wago version which
```

Non-interactively:

```sh
wago version install --canary --use --no-input
```

## The wrong variant is active

```sh
wago version switch canary --profile standard --build normal
```

`wago version current` reports version, profile, and build.

## A `.wago` file stopped loading

Compiled artifacts are tied to Wago's format and the host architecture. Rebuild from the original Wasm:

```sh
wago build module.wasm -o module.wago
```

Distribute `.wasm` for portability or use `wago compile` for a target-specific standalone executable.

## Inspect and clean caches

```sh
wago cache dir
wago cache size
wago cache prune
```

Use `wago cache clean` only when you intend to regenerate the selected data.

## Next

- [Choose a release channel](/guides/versions/channels-and-switching)
- [Troubleshoot modules](/troubleshooting/modules-and-calls)
- [Return to Troubleshooting](/troubleshooting)
