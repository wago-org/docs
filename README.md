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

To add a release, copy the current page tree into its version directory and add
the version to `.vitepress/versions.ts`. The navigation and version-aware
sidebars are generated from that list.

## Deployment

Pull requests run the production build and artifact verification. A push to
`main` deploys `.vitepress/dist` through the protected `github-pages`
environment. Deployment can also be started manually from the Actions tab.

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
