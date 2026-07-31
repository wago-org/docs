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

Canary documentation lives directly under `docs/`. Other rolling channels and
frozen releases live in subdirectories such as `docs/nightly/` and
`docs/v0.0.0/`.

To add a release, copy the current page tree into its version directory and add
the version to `docs/.vitepress/versions.ts`. The navigation and version-aware
sidebars are generated from that list.

## Deployment

Pull requests run the production build and artifact verification. A push to
`main` deploys `docs/.vitepress/dist` through the protected `github-pages`
environment. Deployment can also be started manually from the Actions tab.

The site expects the custom domain `docs.wago.sh`. Configure DNS with a CNAME
record from `docs.wago.sh` to `wago-org.github.io`, then enable HTTPS in the
repository's Pages settings after GitHub provisions the certificate.

The build verifier checks every documented version route, the generated
sitemap, and the custom-domain marker before an artifact can be deployed.
