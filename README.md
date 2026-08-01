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

## Documentation versions

Canary documentation lives directly in the repository root. Other rolling
channels and frozen releases live in directories such as `nightly/` and
`v0.0.0/`.

Only edit the canary documentation directly. Successful Wago releases update
`versions.json` automatically:

- canary records the code release associated with the root documentation;
- nightly snapshots the root into both `nightly/` and an immutable commit-keyed
  source under `.docs-snapshots/`;
- a stable `vMAJOR.MINOR.PATCH` release promotes the snapshot for the exact same
  Wago commit into its permanent version directory.

Stable promotion fails if the code commit never received a nightly snapshot.
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
