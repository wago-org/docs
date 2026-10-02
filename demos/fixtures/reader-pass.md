# Clean-reader verification, 2026-10-02

This is a second pass through the public instructions, starting with empty home,
cache, and project directories. The first pass's prepared projects and local Go
module replacements were not used as proof of a fresh installation.

## Baseline

- Linux/amd64; Go 1.27.1, curl, Git, writable home and network access
- Unix installer resolved manager `canary@449fe89b56f591de82f36b1094c9789a83239412`
- The alternative `go run github.com/wago-org/wago/cli/wago-installer@latest`
  resolved manager `v0.1.0-beta.11` in a separate empty home
- Beta standard/normal runtime: `v0.1.0-beta.11`
- Canary standard/normal runtime and public `@main` Go module:
  `449fe89b56f591de82f36b1094c9789a83239412`
- WASI `0.3.1`, Component Model `0.1.6`, Wide `0.2.2`
- Alternate guest/build tools: WABT 1.0.39, AssemblyScript 0.28.8,
  TinyGo 0.41.1 with Go 1.25.0

Each reader track started with separate `HOME`, `GOPATH`, `GOMODCACHE`,
`GOCACHE`, and project directories. Tool caches were isolated too; the TinyGo
branch exposed an inherited `XDG_CACHE_HOME`, which was corrected before its
rerun. Two Go build workers were used
for this constrained host. Tool binaries were existing declared prerequisites;
Wago installations, downloaded modules, and generated projects were fresh.

A portable isolation setup, before following the pages, is:

```sh
work=$(mktemp -d)
export HOME="$work/home" XDG_CACHE_HOME="$work/cache"
export GOPATH="$work/gopath" GOMODCACHE="$work/mod" GOCACHE="$work/go-build"
export WAGO_HOME="$HOME/.wago" GOWORK=off
mkdir -p "$HOME" "$work/project"
cd "$work/project"
```

Keep your declared Go/curl/Git tools on `PATH`. Do not put another Wago install
on it. After the installer prints its location, follow its PATH instructions.

## Reader-path results

| Pages / commands | Result |
| --- | --- |
| Getting started: Unix installer, alternative Go installer, beta selection, public fib download, exports, implicit call, Go standalone | Passed. Release assets/checksums were unavailable, so the installers successfully used their source-build fallback. Manual PATH setup was needed and is now documented |
| Using plugins: interactive `wago init --run`, explicit `/p1` install and Authority review, downloaded WASI guest, imports, run and standalone | Passed; both executions printed `hello from wasi` |
| WASI: documented `main.go`, `GOOS=wasip1 GOARCH=wasm go build`, argv, `-- --help`, config file, tree/inspect, locked/offline rebuild/run | Passed; configured greeting and arguments matched the page |
| Components: public docs clone, pinned fixture checkout, public artifact downloads, `go run . add` and `go run . wasi` | Passed; typed result 5 and real Rust Preview 2 stdout/stderr matched |
| CLI: text/JSON validation and metadata, typed/repeated calls, parallel/stack options, native artifact trust gate | Passed with beta.11; reusable CLI checks also passed with current canary |
| Configuration: inspect/set/diff/reset, update preview and actual up-to-date check, isolated shell completion install | Passed; separate manager/runtime/Go-module choices clarified |
| Runtime transitions: beta standard → canary standard → beta minimal → standard | Passed; minimal omits `--bare`, so its smoke call used only `--invoke`. Guide now switches back to standard before later tutorials |
| Standalone: Go build, typed arguments, Core 2/parallel options, execution without Wago on PATH | Passed |
| TinyGo standalone: 0.41.1 + Go 1.25.0 | Passed after the sandbox-only VCS-stamping adjustment below; empty-environment executable also returned the right result |
| Profiling: fresh public source clone/build, checked capture, top/annotate/timeline/JSON, Go CPU capture, comparable diff | Passed; intentionally wrong expected result correctly failed |
| Plugin maintenance: public Wide install/review, inspect/tree, public WAT guest, local execution, locked rebuild, removal; WASI graph update/rebuild/run | Passed. A diagnostic first-lane export after Wide's vector addition returned 11 |
| Embedding: eight complete WAT programs in sidebar order, including race-enabled service and artifact round-trip | Passed against both fresh public `@main` and `@latest` (beta.11); no replacement or hidden tidy needed |
| Alternate embedding guests: AssemblyScript and TinyGo | Passed for add, host import, limits, service, and artifact examples |
| Authoring: fresh interactive scaffold, explicit public dependency, catalog and real guest tests | Passed; further examples and Markdown-extracted regressions are covered by `plugins-walkthrough/authoring-regressions/check.py` |

The embedding regression runner now supports a genuinely fresh public dependency
path in addition to its clearly labeled local-checkout mode:

```sh
python3 demos/fixtures/embed-walkthrough/check.py --module-version main
python3 demos/fixtures/embed-walkthrough/check.py --module-version latest
```

These automated checks complement the manual page-by-page pass; they do not test
page navigation or substitute for readable prerequisite instructions.

## Breaks found and fixed

- Version selection sent six canary-only pages to missing beta routes. It now
  preserves an existing destination or falls back to the selected version's home
- The build verifier now checks all rendered internal links and anchors
- Public fixture URLs and clone instructions pointed at files absent on `main`.
  They now select the immutable, publicly available docs fixture revision
- Installer PATH handling, source-build tools, guest toolchain compatibility,
  and tutorial directory continuity were incomplete
- Contract examples used a service before activation and omitted an explicit
  generic interface argument; configuration silently accepted explicit zero
- Authoring examples now distinguish scaffold edits, local Go guest tests,
  and the separately published CLI install path

## Limits

- Only Linux/amd64 was executed. Windows/macOS instructions were source-reviewed
- Linux watch mode failed because procfs child lists are unavailable here
- Native perf was absent; the collector command failed as expected. Go CPU
  sampling passed and is not described as native guest attribution
- The cloud browser could not open the local preview. Production HTML and all
  internal routes/anchors were checked; no interactive browser pass is claimed
- TinyGo with Go 1.27.1 failed its supported-Go-version check. With Go 1.25.0,
  this sandbox's placeholder parent `.git` directories additionally caused VCS
  stamping errors. `GOFLAGS=-buildvcs=false` was an environment-only workaround,
  not a general prerequisite or a hidden module replacement
- No registry publication, merge, deployment, or external account change was made

The site root still redirects to the release-owned **beta snapshot**. Its
prerequisite omissions, moving `@main` dependency, and older authoring guidance
are unchanged. Its first embedding example currently passes in all three guest
languages; the moving dependency remains a reproducibility risk. This work
updates canary sources and shared navigation. Frozen `beta/`, `.docs-snapshots/`,
and `versions.json` are untouched; the release workflow must create the next
qualified snapshot before corrected guide text becomes the default release docs.
