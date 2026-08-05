---
description: Choose between Wago standard and minimal profiles and normal or TinyGo builds.
---

# Profiles and builds

Every runtime selection has a profile and a build. They solve different problems.

## Profiles

| Profile | Includes | Use it for |
|---|---|---|
| `standard` | Complete runtime CLI and plugin experience | Normal development and deployment |
| `minimal` | Run-only surface | Small, fixed execution environments |

## Builds

| Build | Compiler | Tradeoff |
|---|---|---|
| `normal` | Standard Go | Fastest runtime choice |
| `tiny` | TinyGo | Smaller binary |

“Minimal” chooses what the runtime includes. “Tiny” chooses how Wago compiles it. You can combine either profile with either build.

## Install a variant

```sh
wago version install --canary \
  --profile standard \
  --build normal \
  --use
```

For a small run-only tool:

```sh
wago version install --nightly \
  --profile minimal \
  --build tiny \
  --use
```

## Switch variants

```sh
wago version switch canary --profile standard --build normal
```

`wago version current` reports all three parts: version, profile, and build.

## Next

- [Pin the complete selection in automation](/guides/versions/updates-and-automation)
- [Choose a release channel](/guides/versions/channels-and-switching)
- [Return to Release channels](/guides/version-channels)
