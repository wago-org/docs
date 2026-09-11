const PRODUCT_ROUTE = '(?:getting-started|using-plugins|guides(?:/|\\b)|reference(?:/|\\b)|troubleshooting(?:/|\\b))'

function versionsFrom(manifestOrVersions) {
  return Array.isArray(manifestOrVersions)
    ? manifestOrVersions
    : [...manifestOrVersions.channels, ...manifestOrVersions.releases]
}

export function normalizeVersionBase(base) {
  const path = `/${String(base || '').replace(/^\/+|\/+$/g, '')}`
  return path === '/' ? '/' : `${path}/`
}

export function versionDirectory(base) {
  return normalizeVersionBase(base).replace(/^\//, '').replace(/\/$/, '')
}

export function channelBase(manifest, label) {
  const channel = versionsFrom(manifest).find((candidate) => candidate.label === label)
  if (!channel?.base) throw new Error(`versions.json must publish ${label} documentation at a non-root base`)
  return normalizeVersionBase(channel.base).replace(/\/$/, '')
}

export function publishedCanaryPath(manifest, sourcePath) {
  if (sourcePath === 'components.md') return sourcePath
  const versions = versionsFrom(manifest)
  const directories = new Set(versions.map(({ base }) => versionDirectory(base)).filter(Boolean))
  return directories.has(sourcePath.split('/')[0])
    ? sourcePath
    : `${versionDirectory(channelBase(versions, 'canary'))}/${sourcePath}`
}

export function preferredDocsBase(manifest) {
  const official = manifest.releases.find(({ latest, release }) => latest && release)
    ?? manifest.releases.find(({ release }) => release)
  const beta = manifest.channels.find(({ label, release }) => label === 'beta' && release)
  const canary = manifest.channels.find(({ label }) => label === 'canary')
  const preferred = official ?? beta ?? canary

  if (!preferred) throw new Error('No official, beta, or canary documentation route is defined')
  return normalizeVersionBase(preferred.base)
}

export function scopeVersionedHtmlLinks(html, base) {
  const prefix = normalizeVersionBase(base).replace(/\/$/, '')
  return html.replace(new RegExp(`href="/(?=${PRODUCT_ROUTE})`, 'g'), `href="${prefix}/`)
}

export function scopeVersionedMarkdownLinks(markdown, base) {
  const prefix = normalizeVersionBase(base).replace(/\/$/, '')
  return markdown.replace(new RegExp(`\\]\\(/(?=${PRODUCT_ROUTE})`, 'g'), `](${prefix}/`)
}
