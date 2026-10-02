# Wago documentation

The Wago documentation site is built with [VitePress](https://vitepress.dev/) and published at [docs.wago.sh](https://docs.wago.sh/).

## Requirements

- Node.js 22 or newer
- npm 11

## Development

```sh
npm install
npm run docs:dev
```

## Production build

```sh
npm run docs:build
npm run docs:preview
```

Run the same build and artifact checks used by CI with:

```sh
npm ci
npm run docs:check
```

## Terminal demos

The current walkthrough recordings are generated from `demos/run-module.tape`
and `demos/standalone.tape`. Install [VHS](https://github.com/charmbracelet/vhs),
its `ttyd` and `ffmpeg` dependencies, `gifsicle`, and Go. Select a standard Wago
runtime on `PATH`, then run:

```sh
npm run docs:demos
# Or record one walkthrough:
npm run docs:demos -- run-module
```

The script checks the real download, invocation, and standalone result before
recording. Each recording gets a temporary working directory. It inherits the
selected runtime and `WAGO_HOME`; use a clean Wago home when you want to avoid
project or global plugin defaults. No download or command output is mocked.

VHS tapes go through `scripts/humanize-tape.py` for reproducible per-letter
cadence. If Chromium cannot start in your environment, install
[agg](https://docs.asciinema.org/manual/agg/) and use the browser-free path:

```sh
WAGO_DEMO_RENDERER=agg npm run docs:demos
```

That path reads the same tapes, executes their visible commands, and captures
actual combined output in asciicast format before rendering. It supports only
linear command tapes, skips hidden VHS session setup, and fails on a failed
command rather than publishing a successful-looking recording. Both paths use
`gifsicle` and write to `public/demos/`. Inspect the GIFs before committing them.
To record the WASI example, first complete the Preview 1 setup in the guide,
then pass its project directory (with `wago.json` and `wago-lock.json`):

```sh
WAGO_DEMO_PROJECT=/path/to/wasi-example npm run docs:demos -- wasi-command
```

Keep `WAGO_HOME` pointing at the installation that has those plugins cached.
The script copies the manifests into the recording directory and runs a locked,
offline command. Older tapes and recordings remain available for the frozen
release docs.

## Executable walkthroughs

The fixture READMEs in `demos/fixtures/` explain how to repeat the CLI,
embedding, and plugin checks. They are development inputs, excluded from the
published page tree and discovery exports. Keep their pinned toolchain/runtime
versions alongside the results; a Linux smoke test is not an all-platform pass.

## Documentation versions

Canary source lives directly in the repository root and is published at
`/canary/`. Qualified beta and stable documentation is generated into `beta/`
and versioned directories. The site root redirects to the newest available
official release, then beta, then canary.

Only edit the canary documentation directly. Successful Wago canary tags and
beta/stable releases update `versions.json` automatically:

- canary records the code tag associated with the `/canary/` documentation;
- beta releases such as `v0.1.0-beta.1` snapshot the root into both `beta/` and an immutable commit-keyed
  source under `.docs-snapshots/`;
- a stable `vMAJOR.MINOR.PATCH` release promotes the snapshot for the exact same
  Wago commit into its permanent version directory.

Stable promotion fails if the code commit never received a beta snapshot for
the same `vMAJOR.MINOR.PATCH` release series.
This prevents a release from silently publishing documentation for different
code. `.vitepress/versions.ts` reads `versions.json`, so the version selector,
latest marker, provenance links, search index, sitemap, and LLM exports all move
together.

## Deployment

Pull requests run the production build and artifact verification. A push to
`main` deploys `.vitepress/dist` through the protected `github-pages`
environment. Deployment can also be started manually from the Actions tab.

The release synchronization workflow accepts authenticated `code-release`
repository dispatches and also reconciles against GitHub Releases every 15
minutes. The scheduled pass is a recovery path if a cross-repository dispatch is
missed.

The site expects the custom domain `docs.wago.sh`. Configure DNS with a CNAME
record from `docs.wago.sh` to `wago-org.github.io`, then enable HTTPS in the
repository's Pages settings after GitHub provisions the certificate.

The build verifier checks every documented version route, the generated
sitemap, and the custom-domain marker before an artifact can be deployed.

## Search and AI discovery

Every development or production build runs `scripts/generate-discovery.mjs`.
It derives the following artifacts from the Markdown page tree, so adding or
removing a documentation page updates them automatically:

- `/sitemap.xml` with Git-backed modification dates
- `/llms.txt` as a concise, categorized documentation map
- `/llms-full.txt` as the complete documentation corpus
- `/data/docs.json` as a structured page and heading index
- `/raw/**/*.md` as clean Markdown mirrors without site navigation

VitePress also adds a canonical URL, Markdown alternate, Open Graph metadata,
Twitter card metadata, and Schema.org JSON-LD to every rendered page. The
deployment verifier fails if these discovery artifacts drift or disappear.
