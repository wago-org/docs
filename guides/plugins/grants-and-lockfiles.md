---
description: Review Wago plugin capabilities, guest authority, manifests, lockfiles, and resource budgets.
---

# Grants and lockfiles

## Manifest and lockfile

`wago.json` records what the project wants:

```json
{
  "$schema": "https://wago.sh/v0/schema.json",
  "plugins": {
    "wago-org/wasi": "^0.0.0"
  }
}
```

`wago-lock.json` records what Wago resolved and what you approved: exact versions, required and granted capabilities, budgets, and opaque plugin configuration.

Commit both files. Review lockfile changes like a native dependency update.

## Review grants

```sh
wago plugin inspect wago-org/wasi
wago plugin grant wago-org/wasi
```

Automation should name the decision:

```sh
wago plugin add wago-org/wasi \
  --allow host.imports \
  --no-input
```

`--allow-all` and `--deny-all` are available, but an explicit capability list is easier to review.

## Privileged plugin capabilities

| Capability | Authorizes |
|---|---|
| `host.imports` | Host functions and active caller resolution |
| `host.environment` | Wago's narrow host environment |
| `module.compile` | Compile transforms and observations |
| `instance.lifecycle` | Instance creation and close hooks |
| `instance.invoke` | Runtime-managed call hooks |
| `runtime.lifecycle` | Runtime shutdown and cleanup |
| `instance.manage` | Restricted managed instances |

Some grants include budgets such as a live instance cap or per-instance declared memory limit.

## Plugin authority and guest authority

Plugin grants control access to privileged Wago APIs. Guest capabilities such as `fs.read` and `net.outbound` describe what the module may use. Runtime `Policy` applies the guest layer.

Neither layer turns arbitrary plugin Go code into a sandbox. Plugins remain native open-source dependencies.

## Programmatic registration

```go
if err := rt.Use(
	extension,
	wago.WithPluginGrants(wago.PluginHostImports),
); err != nil {
	return err
}
```

Supplying `WithPluginGrants` enables strict authorization for every declared and exercised privileged capability.

## Next

- [Update and rebuild plugins](/guides/plugins/update-and-rebuild)
- [Configure the project manifest](/reference/configuration/project-manifest)
- [Return to Use plugins](/guides/plugins)
