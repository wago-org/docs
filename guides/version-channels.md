---
description: Install, switch, update, and automate Wago runtimes across stable, nightly, and canary releases.
---

# Release channels

The first `wago` executable is a manager. It owns versions, plugins, configuration, and updates, then dispatches runtime commands to the active installation.

## Pick a topic

<CardGroup>
  <Card title="Channels and switching" href="/guides/versions/channels-and-switching" icon="fa-right-left">
    Choose stable, nightly, canary, or an exact commit and move between them.
  </Card>
  <Card title="Profiles and builds" href="/guides/versions/profiles-and-builds" icon="fa-code">
    Understand standard, minimal, normal, and tiny runtime variants.
  </Card>
  <Card title="Updates and automation" href="/guides/versions/updates-and-automation" icon="fa-play">
    Pin CI, preview mutations, update selected parts, and clean old data.
  </Card>
</CardGroup>

## Quick answers

<Accordion title="Which channel should I use?" open>

Use a stable release for production, nightly for recent integrated work, canary for the newest `main`, and an exact commit for reproduction. See [Channels and switching](/guides/versions/channels-and-switching).

</Accordion>

<Accordion title="What is the smallest runtime?">

Choose the `minimal` profile for a run-only CLI and the `tiny` build for a smaller TinyGo binary. They are independent choices. See [Profiles and builds](/guides/versions/profiles-and-builds).

</Accordion>

<Accordion title="How do I pin CI?">

Install an exact release or commit with `--no-input`, name the profile and build, then verify with `wago version current`. See [Updates and automation](/guides/versions/updates-and-automation).

</Accordion>
