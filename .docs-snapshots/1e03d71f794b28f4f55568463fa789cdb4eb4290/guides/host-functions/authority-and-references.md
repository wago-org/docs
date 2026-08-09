---
description: Limit host function authority and safely use Wago caller identity and reference stores.
---

# Limit host authority and use references

A host function runs as trusted Go inside your process. Its authority comes from the values captured by its closure.

## Close over a narrow interface

```go
type Reader interface {
	Read(name string) ([]byte, error)
}

func readImport(files Reader) wago.HostFunc {
	return func(m wago.HostModule, params, results []uint64) {
		// Decode the request, call files.Read, and copy the response back.
	}
}
```

A purpose-built interface is easier to test and review than a closure holding a filesystem root, HTTP client, and database handle together.

Runtime `Policy` controls guest capabilities and coarse declared resource limits. It does not sandbox Go code inside the host callback.

## Do not retain `HostModule`

`HostModule` represents one active synchronous call. Do not store it, send it to another goroutine, or use it as a long-lived instance handle.

Plugins with the required privileged capability can resolve the exact caller while the callback is active. Forged, expired, and cross-runtime values fail closed.

## Reusable host APIs

Use `WithImports` for an application-specific bridge. Package a shared namespace as a plugin so imports, capabilities, configuration, ordering, and cleanup are registered once and reviewed through the manager.
