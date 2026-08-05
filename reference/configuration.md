---
description: Configure Wago globally, override it per project, and control deterministic automation with manifests and flags.
---

# Configuration

Wago layers configuration from broad defaults to one command:

1. Runtime defaults.
2. User-wide configuration.
3. Project settings in `wago.json`.
4. Explicit command flags.

## Pick a topic

<CardGroup>
  <Card title="Scopes and settings" href="/reference/configuration/scopes-and-settings" icon="fa-code">
    Inspect, set, reset, and preview stable or experimental values.
  </Card>
  <Card title="Project manifest" href="/reference/configuration/project-manifest" icon="fa-right-left">
    Configure features, optimizations, workers, and project plugins in `wago.json`.
  </Card>
  <Card title="Automation and Go" href="/reference/configuration/automation-and-go" icon="fa-play">
    Isolate state, install completions, use locked modes, and configure the Go API.
  </Card>
</CardGroup>

## Quick answers

<Accordion title="Why did my project setting win?" open>

Local settings override global settings. Command flags override both. Run `wago config diff` to see sparse overrides. See [Scopes and settings](/reference/configuration/scopes-and-settings).

</Accordion>

<Accordion title="Where do plugin versions and grants live?">

Version constraints live in `wago.json`. Exact resolutions, grants, budgets, and opaque plugin configuration live in `wago-lock.json`. See [Project manifest](/reference/configuration/project-manifest).

</Accordion>

<Accordion title="How do I isolate CI from my normal install?">

Set a job-specific `WAGO_HOME`, pin a runtime, and use `--locked --offline` for the final prepared build. See [Automation and Go](/reference/configuration/automation-and-go).

</Accordion>
