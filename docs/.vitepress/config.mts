import { defineConfig } from 'vitepress'
import { docsVersions } from './versions'

const origin = 'https://docs.wago.sh'
const socialImage = 'https://wago.sh/assets/og-card.png'

function routeFor(relativePath: string) {
  const withoutExtension = relativePath.replace(/\.md$/, '')
  if (withoutExtension === 'index') return '/'
  return withoutExtension.endsWith('/index')
    ? `/${withoutExtension.slice(0, -'index'.length)}`
    : `/${withoutExtension}`
}

function markdownRouteFor(relativePath: string) {
  return `/raw/${relativePath}`
}

function sidebarFor(base: string) {
  const link = (path: string) => `${base}${path}` || '/'

  return [
    {
      text: 'Introduction',
      items: [
        { text: 'Overview', link: link('/') },
        { text: 'Getting started', link: link('/getting-started') }
      ]
    },
    {
      text: 'Reference',
      items: [
        { text: 'Configuration', link: link('/reference/configuration') }
      ]
    },
    ...(base === ''
      ? [
          {
            text: 'Authoring',
            items: [{ text: 'Documentation components', link: '/components' }]
          }
        ]
      : [])
  ]
}

export default defineConfig({
  lang: 'en-US',
  title: 'Wago',
  description: 'Documentation for Wago',
  srcExclude: ['public/**/*.md'],
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'force-dark',
  sitemap: {
    hostname: origin,
    transformItems: (items) => [
      ...items,
      { url: '/llms.txt', changefreq: 'weekly', priority: 0.7 },
      { url: '/llms-full.txt', changefreq: 'weekly', priority: 0.6 },
      { url: '/data/docs.json', changefreq: 'weekly', priority: 0.5 }
    ]
  },
  markdown: {
    languageAlias: {
      wat: 'wasm'
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#1a1547' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap'
      }
    ],
    ['link', { rel: 'icon', type: 'image/png', href: '/wago-logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/wago-logo.png' }],
    ['link', { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'Wago documentation for language models' }],
    ['link', { rel: 'alternate', type: 'application/json', href: '/data/docs.json', title: 'Structured Wago documentation index' }]
  ],

  transformPageData(pageData) {
    const route = routeFor(pageData.relativePath)
    const canonicalUrl = new URL(route, origin).href
    const markdownUrl = new URL(markdownRouteFor(pageData.relativePath), origin).href
    const pageTitle = pageData.title || 'Wago documentation'
    const title = pageTitle === 'Wago documentation' ? pageTitle : `${pageTitle} | Wago documentation`
    const description =
      pageData.frontmatter.description ||
      `${pageTitle} for Wago, the pure-Go WebAssembly engine.`
    const dateModified = pageData.lastUpdated
      ? new Date(pageData.lastUpdated).toISOString()
      : undefined
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: `${origin}/`,
          name: 'Wago documentation',
          description: 'Documentation for Wago, the pure-Go WebAssembly engine.',
          publisher: { '@id': `${origin}/#organization` }
        },
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Wago',
          url: 'https://wago.sh/',
          logo: `${origin}/wago-logo.png`,
          sameAs: ['https://github.com/wago-org/wago']
        },
        {
          '@type': 'TechArticle',
          '@id': `${canonicalUrl}#article`,
          headline: pageTitle,
          description,
          url: canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          isPartOf: { '@id': `${origin}/#website` },
          author: { '@id': `${origin}/#organization` },
          publisher: { '@id': `${origin}/#organization` },
          ...(dateModified ? { dateModified } : {})
        }
      ]
    }

    pageData.description = description
    pageData.frontmatter.head = [
      ...(pageData.frontmatter.head || []),
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['link', { rel: 'alternate', type: 'text/markdown', href: markdownUrl, title: `${pageTitle} as Markdown` }],
      ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' }],
      ['meta', { property: 'og:site_name', content: 'Wago documentation' }],
      ['meta', { property: 'og:type', content: 'article' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:image', content: socialImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: socialImage }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(structuredData).replace(/</g, '\\u003c')]
    ]
  },

  themeConfig: {
    logo: {
      src: '/wago-logo.png',
      alt: 'Wago'
    },
    siteTitle: 'wago',
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: {
            buttonText: 'Search every page…',
            buttonAriaLabel: 'Search all Wago documentation'
          },
          modal: {
            noResultsText: 'No matching documentation found'
          }
        },
        miniSearch: {
          searchOptions: {
            fuzzy: 0.3,
            maxFuzzy: 3,
            prefix: true,
            boost: { title: 8, titles: 5, text: 2 },
            weights: { fuzzy: 0.7, prefix: 0.9 }
          }
        }
      }
    },
    nav: [
      {
        text: 'GitHub',
        link: 'https://github.com/wago-org/wago',
        target: '_blank',
        rel: 'noopener'
      }
    ],
    sidebar: Object.fromEntries(
      [...docsVersions]
        .reverse()
        .map((version) => [version.base || '/', sidebarFor(version.base)])
    ),
    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © Wago contributors'
    }
  }
})
