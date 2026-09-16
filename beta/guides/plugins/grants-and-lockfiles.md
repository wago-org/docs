---
description: Review the installed plugin, its requested access, and the generated lockfile.
---

# Review the install

Adding the plugin created two files. `wago.json` records the plugin and version range you requested. `wago-lock.json` records the exact source, checksums, dependencies, grants, configuration, and Contract bindings Wago built.

Commit both files. Review their diff whenever the plugin graph changes.

## Inspect the graph

Show every direct and transitive plugin:

```sh
wago plugin tree
```

Inspect one installed plugin:

```sh
wago plugin inspect
```

Choose a plugin in the interactive picker. Check its repository, version, dependencies, requested Authorities, reasons, scopes, and Contract bindings. Inspection reads built metadata without starting plugin lifecycle code.

An Authority grants access to one privileged Wago integration API. It does not sandbox the plugin's ordinary Go code. If the request is broader than the plugin's job, cancel the install or edit the grant:

```sh
wago plugin grant
```

The interactive editor can narrow requested modules and resource limits or deny optional access. It cannot grant access the publisher did not request or widen a scope beyond that request.

Next, [run the module and maintain the plugin runtime](./update-and-rebuild).
