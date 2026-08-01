import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { glob } from 'node:fs/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = root
const publicRoot = join(root, 'public')
const rawRoot = join(publicRoot, 'raw')
const origin = 'https://docs.wago.sh'
const versionManifest = JSON.parse(await readFile(join(root, 'versions.json'), 'utf8'))
const versionSections = [
  ...versionManifest.channels.map(({ label, base }) => ({
    base: base.replace(/^\//, ''),
    section: `${label[0].toUpperCase()}${label.slice(1)} channel`
  })),
  ...versionManifest.releases.map(({ label, base }) => ({
    base: base.replace(/^\//, ''),
    section: `Official ${label}`
  }))
]
const versionMatchers = [...versionSections].sort((a, b) => b.base.length - a.base.length)

function routeFor(path) {
  const withoutExtension = path.replace(/\.md$/, '')
  if (withoutExtension === 'index') return '/'
  return withoutExtension.endsWith('/index')
    ? `/${withoutExtension.slice(0, -'index'.length)}`
    : `/${withoutExtension}`
}

function titleFrom(markdown, path) {
  return markdown.match(/^#\s+(.+)$/m)?.[1].trim() || basename(path, '.md')
}

function descriptionFrom(markdown, title) {
  const frontmatterDescription = markdown
    .match(/^---\n([\s\S]*?)\n---/)?.[1]
    ?.match(/^description:\s*(.+)$/m)?.[1]
    ?.trim()
    ?.replace(/^['"]|['"]$/g, '')
  if (frontmatterDescription) return frontmatterDescription

  const body = markdown
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/^#.*$/gm, '')
    .replace(/<[^>]+>/g, '')
  const paragraph = body
    .split(/\n\s*\n/)
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .find((value) => value && !value.startsWith(':::') && !value.startsWith('```'))
  return paragraph || `${title} for Wago, the pure-Go WebAssembly engine.`
}

function cleanMarkdown(markdown) {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/<Step\s+title="([^"]+)"[^>]*>/g, '### $1')
    .replace(/<Tab\s+title="([^"]+)"[^>]*>/g, '### $1')
    .replace(/<Card\s+title="([^"]+)"\s+href="([^"]+)"[^>]*>/g, '### [$1]($2)')
    .replace(/<Card\s+title="([^"]+)"[^>]*>/g, '### $1')
    .replace(/<Accordion\s+title="([^"]+)"[^>]*>/g, '### $1')
    .replace(/<ApiEndpoint\s+method="([^"]+)"\s+path="([^"]+)"[^>]*>/g, '### $1 $2')
    .replace(/<FileTreeItem\s+name="([^"]+)"[^>]*\/?>/g, '- `$1`')
    .replace(/<\/?[A-Z][^>]*>/gs, '')
    .replace(/^:::\s*(\w+)(?:\s+(.+))?$/gm, (_, kind, label = '') => `> **${kind[0].toUpperCase()}${kind.slice(1)}${label ? ` — ${label}` : ''}:**`)
    .replace(/^:::\s*$/gm, '')
    .replace(/^ {2}/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function sectionFor(path) {
  if (path === 'components.md') return 'Optional authoring reference'
  const version = versionMatchers.find(({ base }) => base === '' || path.startsWith(`${base}/`))
  return version?.section || 'Documentation'
}

const paths = []
for await (const path of glob('**/*.md', { cwd: contentRoot })) {
  if (
    path === 'README.md' ||
    path.startsWith(`public${sep}`) ||
    path.startsWith(`node_modules${sep}`) ||
    path.startsWith(`.docs-snapshots${sep}`) ||
    path.startsWith('.docs-sync-') ||
    path.startsWith('.vitepress/') ||
    path.startsWith('.github/')
  ) continue
  paths.push(path.split(sep).join('/'))
}
paths.sort((a, b) => a.localeCompare(b, 'en'))

const pages = await Promise.all(paths.map(async (path) => {
  const source = await readFile(join(contentRoot, path), 'utf8')
  const title = titleFrom(source, path)
  const route = routeFor(path)
  const cleaned = cleanMarkdown(source)
  const headings = [...cleaned.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => match[1].trim())
  return {
    path,
    title,
    description: descriptionFrom(source, title),
    section: sectionFor(path),
    url: new URL(route, origin).href,
    markdown: new URL(`/raw/${path}`, origin).href,
    headings,
    content: cleaned
  }
}))

await rm(rawRoot, { recursive: true, force: true })
for (const page of pages) {
  const target = join(rawRoot, page.path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, `${page.content}\n`)
}

const grouped = Map.groupBy(pages, (page) => page.section)
const sectionOrder = [
  ...versionSections.map(({ section }) => section),
  'Documentation',
  'Optional authoring reference'
]
const summarySections = sectionOrder
  .filter((section) => grouped.has(section))
  .map((section) => `## ${section}\n\n${grouped.get(section)
    .map((page) => `- [${page.title}](${page.markdown}): ${page.description}`)
    .join('\n')}`)
  .join('\n\n')

const llms = `# Wago documentation

> Documentation for Wago, a pure-Go WebAssembly engine with native amd64 and arm64 backends, no cgo, versioned runtime channels, and a capability-based plugin system.

Canonical documentation: ${origin}/
Project website: https://wago.sh/
Source repository: https://github.com/wago-org/wago

Use the Markdown links below for low-noise technical content. Canary tracks the newest successful changes, nightly is refreshed daily, and v0.0.0 is the latest official release documented here.

${summarySections}

## Machine-readable resources

- [Complete documentation in one file](${origin}/llms-full.txt): Every indexed page concatenated as Markdown.
- [Structured documentation index](${origin}/data/docs.json): Canonical URLs, Markdown mirrors, descriptions, and headings as JSON.
- [XML sitemap](${origin}/sitemap.xml): Search-engine discovery with Git-backed modification dates.
`

const full = `# Wago documentation: complete corpus

Canonical source: ${origin}/
Page count: ${pages.length}

This file is generated from the same Markdown sources as the human-facing documentation.

${pages.map((page) => `---\n\nSource page: ${page.url}\nMarkdown: ${page.markdown}\n\n${page.content}`).join('\n\n')}
`

const index = {
  schemaVersion: 1,
  canonicalUrl: `${origin}/`,
  pages: pages.map(({ content, ...page }) => page)
}

await mkdir(join(publicRoot, 'data'), { recursive: true })
await writeFile(join(publicRoot, 'llms.txt'), llms)
await writeFile(join(publicRoot, 'llms-full.txt'), full)
await writeFile(join(publicRoot, 'data', 'docs.json'), `${JSON.stringify(index, null, 2)}\n`)

console.log(`Generated discovery metadata for ${pages.length} documentation pages`)
