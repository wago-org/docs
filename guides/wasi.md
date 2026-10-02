---
description: Run a WASI Preview 1 command, pass arguments and environment, configure streams and mounts, and choose the Preview 2 path.
---

# Run a WASI command

[Using plugins](../using-plugins) gets a Preview 1 hello-world running. Here you will build your own command, pass it arguments, and choose which host resources it can see.

You need a standard Wago runtime, Go 1.22 or newer, and a project directory with `wago.json`.

## Choose the preview

Add the provider that matches the guest:

- **Preview 1** imports the core module `wasi_snapshot_preview1`. Use `wago add wago-org/wasi/p1` and `wago run`.
- **Preview 2** uses component interfaces such as `wasi:cli/run`. Use the typed command service described in [Component Model](./components#run-a-preview-2-command).

The root `wago-org/wasi` bundles both previews. An interactive root install offers a provider choice; a non-interactive root install selects everything. Preview 1 alone does not activate the Component Model provider.

WASI and Component Model support are experimental. Preview 1 supports Wago's six desktop OS/architecture pairs. Preview 2 currently excludes `darwin/amd64`; check the provider's platform declaration before choosing a deployment target.

## Build a small command

Save this as `main.go` in your project:

```go
package main

import (
    "fmt"
    "os"
    "strings"
)

func main() {
    fmt.Println("args:", strings.Join(os.Args[1:], ", "))
    fmt.Println("greeting:", os.Getenv("GREETING"))
}
```

Build it for WASI Preview 1:

::: code-group

```sh [macOS / Linux]
GOOS=wasip1 GOARCH=wasm go build -o command.wasm main.go
```

```powershell [Windows]
$env:GOOS = 'wasip1'
$env:GOARCH = 'wasm'
go build -o command.wasm main.go
Remove-Item Env:GOOS, Env:GOARCH
```

:::

The environment overrides apply to the guest build. Clear them before Wago builds native plugins.

If this is a new directory, initialize it and install Preview 1:

```sh
wago init --run
wago add wago-org/wasi/p1
```

Review the source and four requested Authorities: defining imports in exactly `wasi_snapshot_preview1`, identifying callers, reading guest arguments, and observing instance close. These grants let the plugin integrate with Wago. The plugin still runs as native Go code.

## Pass arguments

Inspect the imports, then run the command:

```sh
wago module imports command.wasm
wago run command.wasm alpha beta
```

Expected output:

```text
args: alpha, beta
greeting:
```

The file path is `argv[0]`; the trailing values become the remaining guest arguments. To pass a guest argument that looks like a Wago flag, use `--`:

```sh
wago run command.wasm -- --help
```

The guest prints `args: --help`. Core exports with parameters still use Wago's typed invocation rules; this example runs a no-argument `_start` command.

## Choose environment values

WASI starts with an empty guest environment. It does not inherit the host process environment.

Save `wasi-config.json`:

```json
{
  "env": ["GREETING=hello from Wago"]
}
```

Apply it and run again:

```sh
wago plugin config github.com/wago-org/wasi/p1 --file wasi-config.json
wago run command.wasm alpha beta
```

Expected output:

```text
args: alpha, beta
greeting: hello from Wago
```

Configuration is a complete replacement. Include every setting you want to keep when changing the JSON. Commit the reviewed lockfile, but do not put secrets in a committed `env` value.

::: warning Check startup after a configuration change
The command rebuilds the runtime, but provider-specific validation happens when the plugin loads. Run a small guest after changing settings. If it fails, restore the last working JSON with `wago plugin config ... --file`.

Running `wago plugin config <id>` without a JSON value or file sets `{}`. It does not prompt for configuration.
:::

## Choose streams

By default, stdin, stdout, and stderr are attached to the host process. Pipe input and redirect output in the shell as usual.

For a guest that must not wait for input, add `"stdin": "eof"` to its configuration. To suppress an output stream, use `"stdout": "discard"` or `"stderr": "discard"`. Keep output inherited while debugging so you can see the guest's diagnostics.

## Grant a directory

There are no filesystem mounts by default. For a guest that reads `/data`, create a host directory and add a rights-bearing mount to the configuration. Replace the host path with your directory's clean absolute path:

```json
{
  "env": ["GREETING=hello from Wago"],
  "mounts": [
    {
      "guest": "/data",
      "host": "/absolute/path/to/guest-data",
      "read": true
    }
  ],
  "maxOpenFiles": 256
}
```

On Windows, use a native absolute host path such as `C:\\guest-data` in JSON. The guest path remains `/data`.

- `read` permits reads and metadata beneath the mounted directory.
- `write` permits file writes and related metadata changes.
- `mutateDirectory` permits creating, removing, and renaming directory entries.

No rights are implied by the other fields. Add write or directory-mutation access only when the guest needs it. Host paths must exist and name directories. The guest cannot escape the mounted directory through path traversal or a symlink. Whether a safe internal symlink or `..` path is accepted depends on the preview and host filesystem implementation.

A guest may request more WASI descriptor rights than its high-level operation suggests. In the walkthrough, Go 1.27's `os.ReadFile` requested rights beyond a read-only mount and received `Capabilities insufficient`. Diagnose the requested rights before widening access; a read-only task should keep a read-only grant. See [WASI access failures](../troubleshooting/plugins-and-builds#wasi-access-fails).

## Keep the runtime reproducible

```sh
wago plugin tree
wago plugin inspect github.com/wago-org/wasi/p1
wago plugin rebuild --locked
wago run command.wasm alpha beta
```

Commit `wago.json` and `wago-lock.json`. The lockfile records the exact provider, configuration, and reviewed Authorities.

Preview 1 commands can also be compiled into a [standalone executable](./cli/standalone). For Preview 2 components or custom WIT exports, continue with [Component Model](./components).
