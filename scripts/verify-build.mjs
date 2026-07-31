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
  'sitemap.xml'
]

await Promise.all(
  expectedFiles.map((file) => access(new URL(file, output)))
)

const cname = (await readFile(new URL('CNAME', output), 'utf8')).trim()
if (cname !== 'docs.wago.sh') {
  throw new Error(`Unexpected CNAME: ${JSON.stringify(cname)}`)
}

const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8')
for (const route of ['/', '/nightly/', '/v0.0.0/']) {
  const url = `https://docs.wago.sh${route}`
  if (!sitemap.includes(url)) {
    throw new Error(`Sitemap is missing ${url}`)
  }
}

console.log(`Verified ${expectedFiles.length} deployment artifacts for docs.wago.sh`)
