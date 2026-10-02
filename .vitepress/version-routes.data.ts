import { createContentLoader } from 'vitepress'
import { docsVersions } from './versions'
import { publishedCanaryPath } from '../scripts/version-routing.mjs'

export declare const data: string[]

export default createContentLoader('**/*.md', {
  globOptions: {
    ignore: [
      '**/node_modules/**', '**/dist/**', '**/.docs-snapshots/**',
      '**/.docs-sync-*/**', '**/public/**', '**/demos/**', '**/README.md'
    ]
  },
  transform(pages) {
    return pages.map(({ url }) => {
      const sourcePath = `${url.slice(1)}${url.endsWith('/') ? 'index' : ''}.md`
      const published = publishedCanaryPath(docsVersions, sourcePath)
      return `/${published.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
    })
  }
})
