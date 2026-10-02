import { access, readFile } from 'node:fs/promises'

function decodeAttribute(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
    if (entity.startsWith('&#')) {
      return String.fromCodePoint(entity[2].toLowerCase() === 'x'
        ? parseInt(entity.slice(3, -1), 16)
        : parseInt(entity.slice(2, -1), 10))
    }
    return { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }[entity.toLowerCase()]
  })
}

function outputPath(pathname) {
  const path = decodeURIComponent(pathname).replace(/^\//, '')
  if (!path || path.endsWith('/')) return `${path}index.html`
  return /\.[^/]+$/.test(path) ? path : `${path}.html`
}

export async function verifyNavigation(output, pageUrls) {
  const htmlCache = new Map()
  const readHtml = async (path) => {
    if (!htmlCache.has(path)) htmlCache.set(path, readFile(new URL(path, output), 'utf8'))
    return htmlCache.get(path)
  }
  let checked = 0
  for (const pageUrl of pageUrls) {
    const source = new URL(pageUrl)
    const html = await readHtml(outputPath(source.pathname))
    for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gs)) {
      const href = decodeAttribute(match[2])
      const target = new URL(href, source)
      if (target.origin !== source.origin) continue
      const path = outputPath(target.pathname)
      try {
        await access(new URL(path, output))
      } catch {
        throw new Error(`${source.pathname} links to missing route ${href}`)
      }
      if (target.hash && path.endsWith('.html')) {
        const targetHtml = await readHtml(path)
        const anchor = decodeURIComponent(target.hash.slice(1))
        const ids = [...targetHtml.matchAll(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/gs)]
          .map((id) => decodeAttribute(id[2]))
        if (!ids.includes(anchor)) {
          throw new Error(`${source.pathname} links to missing anchor ${href}`)
        }
      }
      checked++
    }
  }
  return checked
}
