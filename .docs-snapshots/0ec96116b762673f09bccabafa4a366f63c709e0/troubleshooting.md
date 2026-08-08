---
description: Diagnose Wago installation, runtime, module, plugin, compilation, and Go API failures from the outside in.
---

# Troubleshooting

Most failures happen at a boundary. Start by recording the selected manager, runtime, project, plugins, and module requirements:

```sh
wago --version
wago status
wago version current
wago version which
```

## Pick the failing boundary

<CardGroup>
  <Card title="Installation and runtimes" href="/troubleshooting/installation-and-runtimes" icon="fa-code">
    Fix `PATH`, missing runtimes, wrong variants, and stale compiled artifacts.
  </Card>
  <Card title="Modules and calls" href="/troubleshooting/modules-and-calls" icon="fa-play">
    Diagnose validation, missing imports, exports, arguments, and feature sets.
  </Card>
  <Card title="Plugins and builds" href="/troubleshooting/plugins-and-builds" icon="fa-plug">
    Separate plugin resolution, authorization, lockfile, and standalone build failures.
  </Card>
  <Card title="Go API and memory" href="/troubleshooting/go-api-and-memory" icon="fa-code">
    Fix host signatures, pointer-length checks, cancellation, and instance use.
  </Card>
</CardGroup>

## Report an issue

Include the exact command, complete error, OS, architecture, selected runtime, module SHA-256, and the smallest module that reproduces it. Open an issue at [github.com/wago-org/wago/issues](https://github.com/wago-org/wago/issues).
