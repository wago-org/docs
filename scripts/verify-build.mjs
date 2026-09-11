import { access, readFile } from 'node:fs/promises'
import { preferredDocsBase } from './generate-root-redirect.mjs'
import { channelBase, versionDirectory } from './version-routing.mjs'

const output = new URL('../.vitepress/dist/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('../versions.json', import.meta.url), 'utf8'))
const canaryBase = versionDirectory(channelBase(manifest, 'canary'))
const preferredBase = preferredDocsBase(manifest)
const versionBases = [
  ...manifest.channels.filter(({ release }) => release),
  ...manifest.releases
]
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
  'components.html',
  'demos/install.gif',
  'demos/run-fib.gif',
  'demos/wasi.gif',
  'demos/plugin-authoring.gif',
  'demos/version-switcher.gif',
  '404.html',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'data/docs.json',
  ...versionFiles
]

await Promise.all(
  expectedFiles.map((file) => access(new URL(file, output)))
)

for (const retiredRootPage of ['getting-started.html', 'using-plugins.html', 'reference/configuration.html', 'raw/getting-started.md']) {
  try {
    await access(new URL(retiredRootPage, output))
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  throw new Error(`Versioned documentation leaked back to /${retiredRootPage}`)
}

const rootRedirect = await readFile(new URL('index.html', output), 'utf8')
for (const marker of [
  `http-equiv="refresh" content="0; url=${preferredBase}"`,
  `rel="canonical" href="https://docs.wago.sh${preferredBase}"`,
  `href="${preferredBase}"`,
  'window.location.replace(target)'
]) {
  if (!rootRedirect.includes(marker)) throw new Error(`Root redirect is missing ${marker}`)
}

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
  `${canaryBase}/guides/run-a-module.md`,
  `${canaryBase}/guides/run/write-a-module.md`,
  `${canaryBase}/guides/run/debug-traps.md`,
  `${canaryBase}/guides/embed-wago.md`,
  `${canaryBase}/guides/embed/limits-and-policy.md`,
  `${canaryBase}/guides/embed/services-and-concurrency.md`,
  `${canaryBase}/guides/host-functions.md`,
  `${canaryBase}/guides/plugins.md`,
  `${canaryBase}/guides/plugin-authoring.md`,
  `${canaryBase}/guides/plugins/authoring/first-plugin.md`,
  `${canaryBase}/guides/plugins/authoring/guest-languages.md`,
  `${canaryBase}/guides/plugins/authoring/custom-instructions.md`,
  `${canaryBase}/guides/plugins/authoring/custom-types.md`,
  `${canaryBase}/guides/plugins/authoring/testing.md`,
  `${canaryBase}/guides/plugins/faq.md`,
  `${canaryBase}/guides/version-channels.md`,
  `${canaryBase}/troubleshooting.md`
]) {
  if (!docsIndex.pages.some((page) => page.path === path)) {
    throw new Error(`Structured documentation index is missing ${path}`)
  }
}

const homepage = await readFile(new URL(`${canaryBase}/index.html`, output), 'utf8')
for (const marker of [
  `rel="canonical" href="https://docs.wago.sh/${canaryBase}/"`,
  `type="text/markdown" href="https://docs.wago.sh/raw/${canaryBase}/index.md"`,
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
  `href="/${canaryBase}/getting-started"`,
  'Run a Wasm file'
]) {
  if (!homepage.includes(marker)) throw new Error(`Homepage content did not render ${marker}`)
}

for (const icon of ['play', 'code', 'right-left', 'plug']) {
  if (!homepage.includes(`data-icon="${icon}"`)) {
    throw new Error(`Homepage did not render the Font Awesome ${icon} icon`)
  }
}

const rawHomepage = await readFile(new URL(`raw/${canaryBase}/index.md`, output), 'utf8')
if (!rawHomepage.includes('### [Run a Wasm file](./getting-started)')) {
  throw new Error('Raw homepage lost the destination of its onboarding cards')
}
if (!rawHomepage.includes('### [Extend Wago with plugins](./using-plugins)')) {
  throw new Error('Raw homepage is missing the plugin onboarding route')
}

const gettingStarted = await readFile(new URL(`${canaryBase}/getting-started.html`, output), 'utf8')
const versionMenu = gettingStarted.slice(gettingStarted.indexOf('<div class="version-switcher__menu">'))
const versionOrder = ['Official versions', '>beta</span>', '>canary</span>']
const versionPositions = versionOrder.map((marker) => versionMenu.indexOf(marker))
if (versionPositions.some((position) => position < 0) ||
    versionPositions.some((position, index) => index > 0 && position <= versionPositions[index - 1])) {
  throw new Error(`Version switcher order is not ${versionOrder.join(', ')}`)
}
for (const option of ['macOS / Linux', 'PowerShell']) {
  if (!gettingStarted.includes(`data-title="${option}"`)) {
    throw new Error(`Getting started did not render the ${option} install option`)
  }
}

const rawGettingStarted = await readFile(new URL(`raw/${canaryBase}/getting-started.md`, output), 'utf8')
for (const retiredInstaller of ['https://install.wago.sh/cmd', 'install.cmd']) {
  if (rawGettingStarted.includes(retiredInstaller)) {
    throw new Error(`Getting started still references the retired installer ${retiredInstaller}`)
  }
}
if (!rawGettingStarted.includes('https://wago.sh/corpora/fib.wasm')) {
  throw new Error('Getting started does not use the stable Wago corpus URL')
}
if (!rawGettingStarted.includes('### [Add host capabilities](./using-plugins)')) {
  throw new Error('Getting started is missing the plugin onboarding route')
}

const usingPlugins = await readFile(new URL(`${canaryBase}/using-plugins.html`, output), 'utf8')
for (const marker of [
  '/demos/wasi.gif',
  'plugins.wago.sh/wago-org/wasi',
  'https://wago.sh/corpora/wasi-hello.wasm',
  `href="/${canaryBase}/guides/plugins/install-and-scope"`
]) {
  if (!usingPlugins.includes(marker)) {
    throw new Error(`Using plugins did not render ${marker}`)
  }
}

const rawUsingPlugins = await readFile(new URL(`raw/${canaryBase}/using-plugins.md`, output), 'utf8')
for (const marker of ['# Using plugins', 'Go 1.22 or newer', 'wago add wago-org/wasi', 'wago run wasi-hello.wasm']) {
  if (!rawUsingPlugins.includes(marker)) {
    throw new Error(`Using plugins Markdown is missing ${marker}`)
  }
}

const firstPlugin = await readFile(new URL(`${canaryBase}/guides/plugins/authoring/first-plugin.html`, output), 'utf8')
if (!firstPlugin.includes('/demos/plugin-authoring.gif')) {
  throw new Error('First plugin tutorial did not render its CLI demo')
}

const rawFirstPlugin = await readFile(new URL(`raw/${canaryBase}/guides/plugins/authoring/first-plugin.md`, output), 'utf8')
for (const marker of [
  'wago init --plugin',
  'wago plugin catalog --check',
  'github.com/wago-org/wago@main'
]) {
  if (!rawFirstPlugin.includes(marker)) {
    throw new Error(`First plugin tutorial Markdown is missing ${marker}`)
  }
}
for (const installer of [
  'https://install.wago.sh/unix',
  'https://install.wago.sh/ps'
]) {
  if (!rawGettingStarted.includes(installer)) {
    throw new Error(`Getting started is missing the supported install path ${installer}`)
  }
}

const llms = await readFile(new URL('llms.txt', output), 'utf8')
const full = await readFile(new URL('llms-full.txt', output), 'utf8')
if (!llms.includes(`https://docs.wago.sh/raw/${canaryBase}/getting-started.md`)) {
  throw new Error('llms.txt is missing the getting-started Markdown route')
}
if (!full.includes('# Getting started')) {
  throw new Error('llms-full.txt is missing documentation content')
}

const betaHomepage = await readFile(new URL('beta/index.html', output), 'utf8')
if (!betaHomepage.includes('href="/beta/getting-started"')) {
  throw new Error('Beta documentation links escape the beta route prefix')
}
if (!homepage.includes(`href="/${canaryBase}/getting-started"`)) {
  throw new Error('Canary documentation links escape the canary route prefix')
}

console.log(`Verified ${expectedFiles.length} deployment artifacts and ${docsIndex.pages.length} indexed pages for docs.wago.sh`)
