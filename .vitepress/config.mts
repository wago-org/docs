import { defineConfig } from 'vitepress'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { docsVersions } from './versions'

const origin = 'https://docs.wago.sh'
const tagline = 'A wonderfully quick, compact, and extensible WebAssembly runtime for Go'
const socialImage = 'https://wago.sh/assets/og-card.png'
const sourceRoot = fileURLToPath(new URL('..', import.meta.url))

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
  const pageExists = (path: string) => {
    const route = `${base}${path}` || '/'
    const source = route.endsWith('/') ? `${route}index.md` : `${route}.md`
    return existsSync(join(sourceRoot, source.replace(/^\//, '')))
  }
  const available = (items: { text: string; path: string }[]) =>
    items
      .filter(({ path }) => pageExists(path))
      .map(({ text, path }) => ({ text, link: link(path) }))
  const section = (
    text: string,
    overview: string,
    children: { text: string; path: string }[]
  ) => {
    if (!pageExists(overview)) return null
    const items = available(children)
    if (items.length === 0) return { text, link: link(overview) }
    return {
      text,
      collapsed: true,
      items: [{ text: 'Overview', link: link(overview) }, ...items]
    }
  }

  return [
    {
      text: 'Introduction',
      items: available([
        { text: 'Overview', path: '/' },
        { text: 'Getting started', path: '/getting-started' }
      ])
    },
    {
      text: 'Guides',
      items: [
        section('Run a module', '/guides/run-a-module', [
          { text: 'Invoke an export', path: '/guides/run/invocation' },
          { text: 'Inspect and validate', path: '/guides/run/inspect-and-validate' },
          { text: 'Develop and tune', path: '/guides/run/development' },
          { text: 'Build artifacts', path: '/guides/run/artifacts' }
        ]),
        section('Embed Wago in Go', '/guides/embed-wago', [
          { text: 'Runtime and modules', path: '/guides/embed/runtime-and-modules' },
          { text: 'Calls and guest state', path: '/guides/embed/calls-and-state' },
          { text: 'Imports and artifacts', path: '/guides/embed/imports-and-artifacts' }
        ]),
        section('Host functions', '/guides/host-functions', [
          { text: 'Signatures and slots', path: '/guides/host-functions/signatures' },
          { text: 'Memory and errors', path: '/guides/host-functions/memory-and-errors' },
          { text: 'Authority and references', path: '/guides/host-functions/authority-and-references' }
        ]),
        section('Use plugins', '/guides/plugins', [
          { text: 'Install and choose scope', path: '/guides/plugins/install-and-scope' },
          { text: 'Grants and lockfiles', path: '/guides/plugins/grants-and-lockfiles' },
          { text: 'Update and rebuild', path: '/guides/plugins/update-and-rebuild' },
          { text: 'Publish a plugin', path: '/guides/plugins/publish' }
        ]),
        section('Release channels', '/guides/version-channels', [
          { text: 'Channels and switching', path: '/guides/versions/channels-and-switching' },
          { text: 'Profiles and builds', path: '/guides/versions/profiles-and-builds' },
          { text: 'Updates and automation', path: '/guides/versions/updates-and-automation' }
        ])
      ].filter((item) => item !== null)
    },
    {
      text: 'Reference',
      items: [
        section('Configuration', '/reference/configuration', [
          { text: 'Scopes and settings', path: '/reference/configuration/scopes-and-settings' },
          { text: 'Project manifest', path: '/reference/configuration/project-manifest' },
          { text: 'Automation and Go', path: '/reference/configuration/automation-and-go' }
        ]),
        section('Troubleshooting', '/troubleshooting', [
          { text: 'Installation and runtimes', path: '/troubleshooting/installation-and-runtimes' },
          { text: 'Modules and calls', path: '/troubleshooting/modules-and-calls' },
          { text: 'Plugins and builds', path: '/troubleshooting/plugins-and-builds' },
          { text: 'Go API and memory', path: '/troubleshooting/go-api-and-memory' }
        ])
      ].filter((item) => item !== null)
    },
    ...(base === ''
      ? [
          {
            text: 'Authoring',
            items: [{ text: 'Documentation components', link: '/components' }]
          }
        ]
      : [])
  ].filter(({ items }) => items.length > 0)
}

export default defineConfig({
  lang: 'en-US',
  title: 'Wago',
  description: 'Documentation for Wago',
  srcExclude: ['README.md', '.docs-snapshots/**', '.docs-sync-*/**', 'public/**/*.md'],
  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
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
    [
      'script',
      {},
      `(function(){try{var query=window.matchMedia('(prefers-color-scheme: dark)');var system=query.matches?'dark':'light';var key='wagoDocsSystemTheme';var previous=localStorage.getItem(key);if(previous&&previous!==system)localStorage.removeItem('vitepress-theme-appearance');localStorage.setItem(key,system);var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',system==='dark'?'#1a1547':'#f7f4ff')}catch(_){}})()`
    ],
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
      `${pageTitle} for Wago. ${tagline}`
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
          description: tagline,
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
