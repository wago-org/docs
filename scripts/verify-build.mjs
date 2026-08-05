import { access, readFile } from 'node:fs/promises'

const output = new URL('../.vitepress/dist/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('../versions.json', import.meta.url), 'utf8'))
const versionBases = [...manifest.channels, ...manifest.releases]
  .map(({ base }) => base.replace(/^\//, ''))
  .filter(Boolean)
const versionFiles = versionBases.flatMap((base) => [
  `${base}/index.html`,
  `${base}/getting-started.html`,
  `${base}/reference/configuration.html`,
  `raw/${base}/index.md`
])

const expectedFiles = [
  'index.html',
  'getting-started.html',
  'reference/configuration.html',
  'components.html',
  'demos/install.gif',
  'demos/run-fib.gif',
  'demos/wasi.gif',
  'demos/version-switcher.gif',
  '404.html',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'data/docs.json',
  'raw/index.md',
  'raw/getting-started.md',
  ...versionFiles
]

await Promise.all(
  expectedFiles.map((file) => access(new URL(file, output)))
)

const cname = (await readFile(new URL('CNAME', output), 'utf8')).trim()
if (cname !== 'docs.wago.sh') {
  throw new Error(`Unexpected CNAME: ${JSON.stringify(cname)}`)
}

const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8')
for (const route of ['/', ...versionBases.map((base) => `/${base}/`), '/llms.txt', '/llms-full.txt', '/data/docs.json']) {
  const url = `https://docs.wago.sh${route}`
  if (!sitemap.includes(url)) {
    throw new Error(`Sitemap is missing ${url}`)
  }
}
if (sitemap.includes('/public/raw/')) {
  throw new Error('Generated Markdown mirrors leaked into the HTML sitemap')
}

const docsIndex = JSON.parse(await readFile(new URL('data/docs.json', output), 'utf8'))
if (docsIndex.schemaVersion !== 1 || !Array.isArray(docsIndex.pages) || docsIndex.pages.length === 0) {
  throw new Error('Structured documentation index is incomplete')
}

for (const page of docsIndex.pages) {
  await access(new URL(page.markdown.replace('https://docs.wago.sh/', ''), output))
  const pathname = new URL(page.url).pathname
  const html = pathname === '/'
    ? 'index.html'
    : pathname.endsWith('/')
      ? `${pathname.slice(1)}index.html`
      : `${pathname.slice(1)}.html`
  await access(new URL(html, output))
}

for (const path of [
  'guides/run-a-module.md',
  'guides/embed-wago.md',
  'guides/host-functions.md',
  'guides/plugins.md',
  'guides/version-channels.md',
  'troubleshooting.md'
]) {
  if (!docsIndex.pages.some((page) => page.path === path)) {
    throw new Error(`Structured documentation index is missing ${path}`)
  }
}

const homepage = await readFile(new URL('index.html', output), 'utf8')
for (const marker of [
  'rel="canonical" href="https://docs.wago.sh/"',
  'type="text/markdown" href="https://docs.wago.sh/raw/index.md"',
  'property="og:title"',
  'type="application/ld+json"'
]) {
  if (!homepage.includes(marker)) throw new Error(`Homepage metadata is missing ${marker}`)
}

const jsonLd = homepage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
if (!jsonLd) throw new Error('Homepage JSON-LD is missing')
JSON.parse(jsonLd)

for (const marker of [
  'Welcome to Wago',
  'href="/getting-started"',
  'Run a Wasm file'
]) {
  if (!homepage.includes(marker)) throw new Error(`Homepage content did not render ${marker}`)
}

for (const icon of ['play', 'code', 'right-left', 'plug']) {
  if (!homepage.includes(`data-icon="${icon}"`)) {
    throw new Error(`Homepage did not render the Font Awesome ${icon} icon`)
  }
}

const rawHomepage = await readFile(new URL('raw/index.md', output), 'utf8')
if (!rawHomepage.includes('### [Run a Wasm file](/getting-started)')) {
  throw new Error('Raw homepage lost the destination of its onboarding cards')
}

const gettingStarted = await readFile(new URL('getting-started.html', output), 'utf8')
for (const os of ['macOS / Linux', 'Windows']) {
  if (!gettingStarted.includes(`>${os}</button>`)) {
    throw new Error(`Getting started did not render the ${os} install tab`)
  }
}

const rawGettingStarted = await readFile(new URL('raw/getting-started.md', output), 'utf8')
if (!rawGettingStarted.includes('https://wago.sh/corpora/fib.wasm')) {
  throw new Error('Getting started does not use the stable Wago corpus URL')
}
for (const installer of [
  'https://install.wago.sh/unix',
  'https://install.wago.sh/ps',
  'https://install.wago.sh/cmd',
  'go get github.com/wago-org/wago'
]) {
  if (!rawGettingStarted.includes(installer)) {
    throw new Error(`Getting started is missing the supported install path ${installer}`)
  }
}

const llms = await readFile(new URL('llms.txt', output), 'utf8')
const full = await readFile(new URL('llms-full.txt', output), 'utf8')
if (!llms.includes('https://docs.wago.sh/raw/getting-started.md')) {
  throw new Error('llms.txt is missing the getting-started Markdown route')
}
if (!full.includes('# Getting started')) {
  throw new Error('llms-full.txt is missing documentation content')
}

console.log(`Verified ${expectedFiles.length} deployment artifacts and ${docsIndex.pages.length} indexed pages for docs.wago.sh`)
