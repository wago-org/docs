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
  `${canaryBase}/guides/cli.md`,
  `${canaryBase}/guides/cli/configuration.md`,
  `${canaryBase}/guides/embed/runtime-and-modules.md`,
  `${canaryBase}/guides/embed/calls-and-state.md`,
  `${canaryBase}/guides/embed/limits-and-policy.md`,
  `${canaryBase}/guides/embed/services-and-concurrency.md`,
  `${canaryBase}/guides/embed/host-functions.md`,
  `${canaryBase}/guides/embed/artifacts.md`,
  `${canaryBase}/guides/plugins.md`,
  `${canaryBase}/guides/plugin-authoring.md`,
  `${canaryBase}/guides/plugins/authoring/first-plugin.md`,
  `${canaryBase}/guides/plugins/authoring/guest-languages.md`,
  `${canaryBase}/guides/plugins/authoring/custom-instructions.md`,
  `${canaryBase}/guides/plugins/authoring/custom-types.md`,
  `${canaryBase}/guides/plugins/authoring/testing.md`,
  `${canaryBase}/guides/plugins/faq.md`,
  `${canaryBase}/troubleshooting.md`
]) {
  if (!docsIndex.pages.some((page) => page.path === path)) {
    throw new Error(`Structured documentation index is missing ${path}`)
  }
}

for (const retiredPath of [
  `${canaryBase}/guides/run-a-module.md`,
  `${canaryBase}/guides/run/write-a-module.md`,
  `${canaryBase}/guides/run/invocation.md`,
  `${canaryBase}/guides/run/inspect-and-validate.md`,
  `${canaryBase}/guides/run/development.md`,
  `${canaryBase}/guides/run/artifacts.md`,
  `${canaryBase}/guides/run/debug-traps.md`,
  `${canaryBase}/guides/version-channels.md`,
  `${canaryBase}/guides/versions/channels-and-switching.md`,
  `${canaryBase}/guides/versions/profiles-and-builds.md`,
  `${canaryBase}/guides/versions/updates-and-automation.md`,
  `${canaryBase}/guides/embed-wago.md`,
  `${canaryBase}/guides/host-functions.md`,
  `${canaryBase}/guides/embed/imports-and-artifacts.md`,
  `${canaryBase}/guides/host-functions/signatures.md`,
  `${canaryBase}/guides/host-functions/memory-and-errors.md`,
  `${canaryBase}/guides/host-functions/authority-and-references.md`
]) {
  if (docsIndex.pages.some((page) => page.path === retiredPath)) {
    throw new Error(`Structured documentation index still contains ${retiredPath}`)
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
for (const [version, html, sidebarOrder] of [
  ['canary', gettingStarted, ['>Introduction</h2>', '>CLI</h2>', '>EMBED</h2>', '>PLUGINS</h2>', '>Reference</h2>']],
  ['beta', await readFile(new URL('beta/getting-started.html', output), 'utf8'), ['>Introduction</h2>', '>EMBED</h2>', '>PLUGINS</h2>', '>Reference</h2>']]
]) {
  const positions = sidebarOrder.map((marker) => html.indexOf(marker))
  if (positions.some((position) => position < 0) ||
      positions.some((position, index) => index > 0 && position <= positions[index - 1])) {
    throw new Error(`${version} sidebar order is not ${sidebarOrder.map((marker) => marker.slice(1, -5)).join(', ')}`)
  }
  const introduction = html.slice(positions[0], positions[1])
  const introductionOrder = ['>Overview</p>', '>Getting started</p>', '>Using plugins</p>']
    .map((marker) => introduction.indexOf(marker))
  if (introductionOrder.some((position) => position < 0) ||
      introductionOrder.some((position, index) => index > 0 && position <= introductionOrder[index - 1])) {
    throw new Error(`${version} introduction order is not Overview, Getting started, Using plugins`)
  }
}
if (!gettingStarted.includes(`href="/${canaryBase}/guides/cli"`)) {
  throw new Error('Canary sidebar is missing the CLI overview')
}
if (!gettingStarted.includes(`href="/${canaryBase}/guides/cli/configuration"`)) {
  throw new Error('Canary sidebar is missing the CLI configuration guide')
}
const cliSidebar = gettingStarted.slice(
  gettingStarted.indexOf('>CLI</h2>'),
  gettingStarted.indexOf('>EMBED</h2>')
)
for (const route of [
  '/guides/cli',
  '/guides/cli/configuration'
]) {
  if (!cliSidebar.includes(`href="/${canaryBase}${route}"`)) {
    throw new Error(`Canary CLI sidebar is missing ${route}`)
  }
}
for (const retiredRoute of ['/guides/run/', '/guides/version-channels', '/guides/versions/']) {
  if (cliSidebar.includes(`href="/${canaryBase}${retiredRoute}`)) {
    throw new Error(`Canary CLI sidebar still contains ${retiredRoute}`)
  }
}
const embedSidebar = gettingStarted.slice(
  gettingStarted.indexOf('>EMBED</h2>'),
  gettingStarted.indexOf('>PLUGINS</h2>')
)
for (const route of [
  '/guides/embed/runtime-and-modules',
  '/guides/embed/calls-and-state',
  '/guides/embed/host-functions',
  '/guides/embed/limits-and-policy',
  '/guides/embed/services-and-concurrency',
  '/guides/embed/artifacts'
]) {
  if (!embedSidebar.includes(`href="/${canaryBase}${route}"`)) {
    throw new Error(`Canary Embed sidebar is missing ${route}`)
  }
}
for (const retiredRoute of ['/guides/embed-wago', '/guides/host-functions']) {
  if (embedSidebar.includes(`href="/${canaryBase}${retiredRoute}"`)) {
    throw new Error(`Canary Embed sidebar still contains ${retiredRoute}`)
  }
}
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

const rawCliOverview = await readFile(new URL(`raw/${canaryBase}/guides/cli.md`, output), 'utf8')
for (const marker of [
  '# Use the CLI',
  '## Invoke an export',
  'wago run --invoke fib fib.wasm 30',
  '## Inspect and validate',
  'wago module capabilities fib.wasm',
  '## Develop',
  '## Debug a trap',
  '## Cache native code',
  'wago run --allow-native-artifact fib.wago 20'
]) {
  if (!rawCliOverview.includes(marker)) {
    throw new Error(`CLI overview is missing ${marker}`)
  }
}

const rawCliConfiguration = await readFile(new URL(`raw/${canaryBase}/guides/cli/configuration.md`, output), 'utf8')
for (const marker of [
  '# Configure and manage Wago',
  '## Save configuration',
  'wago config diff --local',
  'wago config set optimizations.inline off --local',
  '## Install completions',
  'wago config completions zsh --install',
  '## Select a runtime',
  'wago version install --version <commit> --use --no-input',
  '## Choose a build',
  '## Update',
  'wago update --all --dry-run --json'
]) {
  if (!rawCliConfiguration.includes(marker)) {
    throw new Error(`CLI configuration guide is missing ${marker}`)
  }
}

const embedPages = [
  ['runtime-and-modules', ['# Run WebAssembly from Go', 'go get github.com/wago-org/wago@main', '### WAT', '### AssemblyScript', '### TinyGo', 'wat2wasm guest/add.wat -o module.wasm', 'assemblyscript@0.28.8', 'tinygo build -target=wasm-unknown', 'runtime.Compile(wasm)', 'runtime.Instantiate(ctx, module)', 'slices.Contains(module.Exports(), "_initialize")', '"add",']],
  ['calls-and-state', ['# Work with calls and state', 'wat2wasm counter.wat -o counter.wasm', 'instance.GlobalValue("count")', 'instance.SetGlobalValue("count", wago.ValueI32(40))', 'fresh instance: 1']],
  ['host-functions', ['# Let Wasm call Go', '### WAT', '### AssemblyScript', '### TinyGo', '@external("host", "mul")', '//go:wasmimport host mul', 'wago.NewImports()', 'imports.HostFunc("host", "mul"', 'func(caller wago.Caller, call wago.HostCall)', 'panic(wago.HostTrap{Err: err})']],
  ['limits-and-policy', ['# Add limits and cancellation', 'WithMaxModuleBytes(16<<20)', 'wago.WithPolicy(policy)', 'context.WithTimeout', 'Truly hostile blocking code needs process isolation']],
  ['services-and-concurrency', ['# Run Wago in a service', 'func NewService(wasm []byte)', 'func (s *Service) Fib(', 's.runtime.CloseContext(ctx)', 'go test -race ./...']],
  ['artifacts', ['# Cache compiled code', 'compiled.MarshalBinary()', 'wago.LoadTrustedArtifact(trustedBytes)', 'runtime.AdoptModule(trusted)', 'Treat artifacts as executable code']]
]
for (const [page, markers] of embedPages) {
  const markdown = await readFile(new URL(`raw/${canaryBase}/guides/embed/${page}.md`, output), 'utf8')
  for (const marker of markers) {
    if (!markdown.includes(marker)) {
      throw new Error(`Embed page ${page} is missing ${marker}`)
    }
  }
  if (markdown.includes('github.com/wago-org/wago/examples/')) {
    throw new Error(`Embed page ${page} links to the examples package`)
  }
}

const rawPluginsOverview = await readFile(new URL(`raw/${canaryBase}/guides/plugins.md`, output), 'utf8')
for (const marker of [
  '# Use plugins',
  'Project → add plugin → review access → build runtime → run module',
  '## Follow the tutorial',
  '- [Create a local project and add a plugin]',
  '- [Run the module, update the plugin, and rebuild from the lockfile]'
]) {
  if (!rawPluginsOverview.includes(marker)) {
    throw new Error(`Plugins overview is missing ${marker}`)
  }
}

const pluginSteps = [
  ['install-and-scope', ['# Add a plugin', 'wago init', 'Select **Run WebAssembly**', 'wago module imports module.wasm', 'wago add JairusSW/wide', 'wago plugins list']],
  ['grants-and-lockfiles', ['# Review the install', 'wago plugin tree', 'wago plugin inspect', 'wago plugin grant', 'wago-lock.json']],
  ['update-and-rebuild', ['# Run and maintain the plugin', 'wago run module.wasm', 'wago plugin outdated', 'wago plugin update', 'wago plugin rebuild']]
]
for (const [page, markers] of pluginSteps) {
  const markdown = await readFile(new URL(`raw/${canaryBase}/guides/plugins/${page}.md`, output), 'utf8')
  for (const marker of markers) {
    if (!markdown.includes(marker)) {
      throw new Error(`Plugin tutorial step ${page} is missing ${marker}`)
    }
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
