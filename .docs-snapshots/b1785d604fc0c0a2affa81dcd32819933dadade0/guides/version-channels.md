---
description: Install a Wago channel, choose a runtime profile and build, switch versions, and pin automation to a release.
---

# Release channels and builds

Wago keeps the manager separate from the runtime that executes WebAssembly. Start by checking what is active, then install and switch between canary, nightly, and official releases without replacing project files.

## 1. Check what you are using

```sh
wago status
```

Look for the active version, channel, profile, and build. If no runtime is selected, install one in the next step.

## 2. Pick a channel

<Tabs sync="release-channel">
  <Tab title="Nightly">

Nightly is the best starting point while Wago is pre-release. It follows `main` on a daily cadence, but an individual nightly never changes after publication.

```sh
wago version install --nightly --use
```

Each build has an immutable date-and-commit tag. The name `nightly` resolves the newest one.

  </Tab>
  <Tab title="Canary">

Canary follows every successful `main` CI run. Use it to try a recent fix or behavior before the next nightly.

```sh
wago version install --canary --use
```

Canary can break between updates. Keep production and repeatable CI on a pinned release.

  </Tab>
  <Tab title="Official">

Install the newest official release:

```sh
wago version install --latest --use
```

Once you know the version, pin it in automation:

```sh
wago version install 0.1.0 --use
```

Pinned versions do not move when another release appears.

  </Tab>
</Tabs>

`--use` activates the installed runtime. Without it, Wago asks whether you want to switch.

## 3. Confirm the change

```sh
wago --version
wago status
```

The first command reports the manager and runtime. The second includes the selected project and plugin scope, which matters when two directories behave differently.

## 4. Choose a profile

<ComparisonTable :columns="['Standard', 'Minimal']">
  <ComparisonRow feature="Purpose" :values="['Complete runtime command surface', 'Run-focused runtime']" />
  <ComparisonRow feature="Best for" :values="['Development and inspection', 'Smaller deployments']" />
  <ComparisonRow feature="Plugin workflow" :values="['Full tooling available', 'Prepare with the manager or Standard profile']" />
</ComparisonTable>

Standard is the sensible first choice:

```sh
wago version install --nightly --profile standard --use
```

Choose Minimal after you know which commands the deployed runtime needs.

## 5. Choose a build

- **Normal** uses the standard Go compiler and favors runtime speed.
- **Tiny** uses TinyGo and favors executable size.

Install a Tiny Minimal runtime like this:

```sh
wago version install --nightly --profile minimal --build tiny --use
```

Not every release has every operating-system, architecture, profile, and build combination. When an artifact is missing, Wago can build the release from source if Git and the required Go or TinyGo toolchain are available. Checksum mismatches and network failures still stop the install.

## 6. Switch an installed runtime

![Opening and moving through Wago's interactive version selector](/demos/version-switcher.gif)

List what is already on the machine:

```sh
wago version list
```

Open the interactive selector:

```sh
wago version switch
```

Use the arrow keys to choose a version and press <kbd>Enter</kbd>. For scripts, pass the target and the profile or build flags shown by `wago version switch --help`.

Plugin intent can be shared, but compiled plugin runtimes stay isolated by Wago version, profile, and build. Switching never reuses an incompatible plugin binary.

## 7. Move a rolling channel forward

```sh
wago version update nightly
wago version update --canary
```

An official version such as `0.1.0` does not update in place. Install another version and switch to it.

Finish with:

```sh
wago status
```

That final check catches the wrong channel, profile, build, or project scope before you run a module.
