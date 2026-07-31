import { defineConfig } from 'vitepress'
import { docsVersions } from './versions'

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
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'force-dark',
  sitemap: {
    hostname: 'https://docs.wago.sh'
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
    ['link', { rel: 'apple-touch-icon', href: '/wago-logo.png' }]
  ],

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
