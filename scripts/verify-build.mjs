import { access, readFile } from 'node:fs/promises'

const output = new URL('../docs/.vitepress/dist/', import.meta.url)

const expectedFiles = [
  'index.html',
  'getting-started.html',
  'reference/configuration.html',
  'components.html',
  'nightly/index.html',
  'nightly/getting-started.html',
  'nightly/reference/configuration.html',
  'v0.0.0/index.html',
  'v0.0.0/getting-started.html',
  'v0.0.0/reference/configuration.html',
  '404.html',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'data/docs.json',
  'raw/index.md',
  'raw/getting-started.md',
  'raw/nightly/index.md',
  'raw/v0.0.0/index.md'
]

await Promise.all(
  expectedFiles.map((file) => access(new URL(file, output)))
)

const cname = (await readFile(new URL('CNAME', output), 'utf8')).trim()
if (cname !== 'docs.wago.sh') {
  throw new Error(`Unexpected CNAME: ${JSON.stringify(cname)}`)
}

const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8')
for (const route of ['/', '/nightly/', '/v0.0.0/', '/llms.txt', '/llms-full.txt', '/data/docs.json']) {
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

const llms = await readFile(new URL('llms.txt', output), 'utf8')
const full = await readFile(new URL('llms-full.txt', output), 'utf8')
if (!llms.includes('https://docs.wago.sh/raw/getting-started.md')) {
  throw new Error('llms.txt is missing the getting-started Markdown route')
}
if (!full.includes('# Getting started')) {
  throw new Error('llms-full.txt is missing documentation content')
}

console.log(`Verified ${expectedFiles.length} deployment artifacts and ${docsIndex.pages.length} indexed pages for docs.wago.sh`)
