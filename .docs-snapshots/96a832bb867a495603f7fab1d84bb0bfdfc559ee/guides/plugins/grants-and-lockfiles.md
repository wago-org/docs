---
description: Review exact Wago Plugin Authorities, dependencies, typed Contracts, lockfiles, and resource limits.
---

# Review Authorities, Contracts, and the lockfile

The manifest records direct project intent. The lockfile records the complete
resolution and every authority-bearing decision you reviewed.

## Manifest and lock graph

`wago.json` contains canonical Plugin IDs and semantic-version ranges:

```json
{
  "$schema": "https://wago.sh/v1/schema.json",
  "plugins": {
    "github.com/JairusSW/pool": "^0.1.0"
  }
}
```

Pool requires Workers. Wago resolves Workers once as a transitive plugin and
records the exact Pool-to-Workers Contract binding in `wago-lock.json`. The lock
also contains source versions and Go checksums, release and definition digests,
published Authority Requests, reviewed Authority Grants, configuration, and the
complete dependency graph.

Commit both files. Review lockfile changes like a native dependency update.

## Inspect before changing

```sh
wago plugin tree
```

Then inspect the plugin you plan to change:

```sh
wago plugin inspect github.com/JairusSW/pool
```

Both commands are side-effect-free. They do not call plugin factories, registration, or lifecycle code.

## Review exact Authorities

An Authority grants one privileged Wago integration. Its dots group related names for display; they do not grant parents, wildcards, descendants, or future Authorities.

Read the reason first, then check that the scope matches the job. Host imports should name only the guest import modules they define. Caller identity and guest re-entry are separate grants. Runtime, module, instance, and invocation hooks each have separate observe or intercept grants.

Instance ownership, core compilation, core instantiation, and host function references carry reviewed resource limits. Compiler types are restricted to named namespaces; custom instructions are restricted to named Wasm modules. The authoring guide puts each exact Authority beside the API that uses it.

Every request has a `required` or `optional` mode, a human explanation, and any
scope Wago can enforce. A required Authority must have a grant, but you can
still narrow its modules or limits. An optional Authority may be denied
entirely. A plugin that cannot operate under the reviewed scope fails before the
plan commits.

Interactive add and update show one consolidated review. To change an existing selection, open the grant editor:

```sh
wago plugin grant github.com/wago-org/workers
```

The editor cannot add a module, raise a requested limit, or grant an Authority the definition did not request. Instance-owning limits are positive; zero does not mean unlimited. `maxMemoryBytes` bounds the aggregate declared maximum across all live instances owned through that handle.

For non-interactive builds, see [Automation and Go](../../reference/configuration/automation-and-go).

## Typed cross-plugin Contracts

Plugins call each other through typed Contracts identified by a canonical ID
and positive incompatible major version. A consumer declares one of:

- `required`: exactly one provider;
- `optional`: zero or one provider; or
- `many`: every selected provider in the exact reviewed binding order.

The package requirement selects and links a provider package. The Contract
binds the interface among selected providers. Both edges participate in one
cycle-checked graph, and the exact binding is stored in the lockfile.

Wago rejects missing required providers, incompatible majors, duplicate single
providers, altered locked bindings, and cycles before any factory runs.
Contract calls use callback leases rather than raw `Get` values. During close,
a consumer can still use its dependencies from its own `Stop`; before provider
teardown, Wago rejects new calls and waits for in-flight calls to finish.

Compile observers receive an opaque digest of the final source bytes after all
transformers. The precompiled `Runtime.Module` path reports a zero digest because
the source is unavailable. `Module.Close` ends only the runtime-bound wrapper,
emits one close event, and leaves ownership of the caller-visible compiled
artifact with its caller.

## Plugin authority and guest authority

Plugin Authorities control access to privileged Wago integration handles. Guest
capabilities such as `fs.read` and `net.outbound` describe what a Wasm module may
use, and Runtime `Policy` applies that guest layer.

Neither layer turns arbitrary plugin Go code into a sandbox. Plugins are native
open-source dependencies linked into the host and must still be audited as
such.

## Verify locked state in CI

```sh
wago plugin rebuild --locked
```

Locked rebuilding verifies reachability, dependency ranges, checksums, release
fingerprints, provider catalogs, definition digests, grants, configuration,
Contract bindings, target compatibility, and the dry-run Plugin Plan before it
reproduces the artifact without changing project state.
