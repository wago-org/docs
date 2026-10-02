---
description: Diagnose Wago plugin resolution, Authority Grants, Contract bindings, lockfiles, offline mode, and standalone builds.
---

# Fix plugin resolution and standalone builds

Inspect the selected scope and resolved plugin graph before changing grants, lockfiles, offline mode, or compiler settings.

If you need a concept explained rather than an error diagnosed, start with the [Plugin FAQ](../guides/plugins/faq).

## Inspect plugin state

```sh
wago status
wago plugin tree
wago plugin list --json
wago plugin inspect github.com/wago-org/wasi
wago plugin rebuild --locked
```

Then identify the failing stage:

- If `wago.providers.json` is missing or stale, run `wago plugin catalog`,
  inspect the diff, and commit it before tagging. Use
  `wago plugin catalog --check` in CI.
- If publish reports an exact-source mismatch, the tagged module's
  `wago.json` or `wago.providers.json` differs from the local release. Move the
  version forward and create a new tag after committing both artifacts; do not
  reuse a published Go module version.
- `wago plugin outdated` checks for newer releases.
- `wago plugin grant github.com/wago-org/wasi` edits reviewed Authority scope.
- `wago plugin rebuild` reproduces locked versions.
- `wago plugin update github.com/wago-org/wasi` changes resolution and rebuilds.

Use `--verbose` when the underlying Go build diagnostic matters.

## A first plugin passes tests but cannot load

The scaffold's original test only checks the provider catalog. It does not call `Register`. Add the [guest execution test](../guides/plugins/authoring/first-plugin#call-it-from-wasm).

For `unsupported host callback func() int32`, use the portable result-slot callback:

```go
imports.HostFunc("tutorial", "answer", func(call wago.HostCall) {
    call.SetI32(0, 42)
}).Results(wago.ValI32)
```

For `selected plugin is unreachable from every reviewed direct root`, mark the intended root selection `Direct: true`, or connect it through a selected consumer's declared dependency. Do not mark every transitive provider direct just to silence the graph check.

## Configuration succeeds but startup fails

`wago plugin config` checks JSON syntax and rebuilds. A provider can still reject the value or fail to open a resource when the next runtime loads.

Restore your last working configuration and smoke-test it:

```sh
wago plugin config github.com/wago-org/wasi/p1 --file wasi-config.json
wago run wasi-hello.wasm
```

The value is a complete replacement, not a field merge. Omitting both the JSON argument and `--file` applies `{}`; the command does not open a configuration editor. Unknown WASI fields, relative host paths, missing mount directories, and invalid environment entries are common startup failures.

## A component reports `bad version at offset 4`

Check whether the file is a Component Model binary, such as Rust output for `wasm32-wasip2`. The current `wago run` path decodes core Wasm modules. Installing `/p2` does not add component dispatch to that command.

Use the [typed Component Model or Preview 2 Go service](../guides/components), or build a Preview 1 command for `wago run`. A real malformed core binary can produce the same decoder error, so verify the guest target before changing plugins.

## WASI access fails

- The guest environment is empty unless `env` explicitly supplies values. Exporting a variable in your shell does not pass it to WASI.
- Filesystem access needs a configured mount with the required rights. A host path existing on disk is not enough.
- `read`, `write`, and `mutateDirectory` are separate. A read grant does not permit creating an output file.
- `Capabilities insufficient` can mean the guest requested wider descriptor rights than the mount allows. For example, Go 1.27's Preview 1 `os.ReadFile` requests a broad inheriting-rights mask. Do not widen a read-only mount without checking the guest's needs.
- Paths that escape a preopen are denied. Safe internal symlink or `..` behavior depends on the preview and host filesystem implementation; use paths below the intended preopen.
- Preview 2 socket and name-lookup interfaces return `access-denied` while networking is disabled. Adding the provider does not grant network access.

Review the [WASI configuration walkthrough](../guides/wasi) and the exact provider version in `wago-lock.json`.

## Locked mode fails

The operation would need to change `wago.json` or `wago-lock.json`. Preview it outside the final build:

```sh
wago plugin update --dry-run --json
```

Review and commit the result, then retry locked mode.

Locked mode can also fail when a transitive edge, source checksum, release
fingerprint, provider catalog, definition digest, Authority Grant, configuration,
or Contract binding no longer matches the committed graph. The locked rebuild
identifies the exact field; do not hand-edit a digest or binding to silence it.

## Dependency resolution fails

The plan reports every constraint and the parent that contributed it. If no
global solution exists, update or remove the conflicting direct requirement
rather than forcing one transitive version. Wago backtracks across available
releases and prefers the highest deterministic complete solution, so a conflict
means the published ranges genuinely cannot be satisfied together.

A dependency or Contract cycle is invalid even when every individual range is
compatible. Break the package edge or move the shared behavior behind a lower
level Contract provider.

## Contract binding fails

Check the consumer's Contract ID, major, and mode against the selected provider:

```sh
wago plugin list --json
```

Required and optional Contracts accept at most one provider; `many` accepts the
complete deterministic provider list. A different major is deliberately
incompatible. Locked mode never silently chooses a replacement provider.

## An Authority is denied

Inspect the published request and current grant:

```sh
wago plugin inspect github.com/wago-org/workers
wago plugin grant github.com/wago-org/workers
```

A required Authority must remain present, but its scope can be narrowed. If the
plugin needs a withheld module or a larger minimum resource budget, registration
or startup fails when the runtime loads. Restore the previous reviewed scope
with `wago plugin grant`, then run a representative guest. A grant cannot widen
the publisher's request.

## Offline mode fails

A required module or artifact is missing locally. Fetch it during an intentional networked preparation step, then run the final build offline.

## Standalone compilation fails

Preview the plan:

```sh
wago compile fib.wasm --invoke fib --dry-run --json
```

Check that:

- `_start` exists or `--invoke` names a real export;
- the target is Darwin, Linux, or Windows on AMD64 or ARM64;
- required plugins are selected;
- every required Contract has its locked provider;
- dependencies exist locally when offline mode is enabled;
- plugins support the target.

Show the Go build output:

```sh
wago compile fib.wasm --invoke fib --verbose -o fib
```
