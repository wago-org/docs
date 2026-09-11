import assert from 'node:assert/strict'
import test from 'node:test'
import { preferredDocsBase, renderRootRedirect } from './generate-root-redirect.mjs'
import { publishedCanaryPath, scopeVersionedHtmlLinks, scopeVersionedMarkdownLinks } from './version-routing.mjs'

const release = { tag: 'tag' }

test('prefers official documentation, then beta, then canary', () => {
  const manifest = {
    releases: [{ base: '/v1.0.0', latest: true, release }],
    channels: [
      { label: 'canary', base: '/canary', release },
      { label: 'beta', base: '/beta', release }
    ]
  }

  assert.equal(preferredDocsBase(manifest), '/v1.0.0/')
  assert.equal(preferredDocsBase({ ...manifest, releases: [] }), '/beta/')
  assert.equal(
    preferredDocsBase({ releases: [], channels: [manifest.channels[0]] }),
    '/canary/'
  )
})

test('ignores unpublished versions and normalizes the target', () => {
  assert.equal(preferredDocsBase({
    releases: [{ base: '/v2.0.0', latest: true, release: null }],
    channels: [
      { label: 'beta', base: '/beta', release: null },
      { label: 'canary', base: 'canary/', release }
    ]
  }), '/canary/')
})

test('always falls back to the defined canary route', () => {
  assert.equal(preferredDocsBase({
    releases: [],
    channels: [
      { label: 'beta', base: '/beta', release: null },
      { label: 'canary', base: '/canary', release: null }
    ]
  }), '/canary/')
})

test('renders an accessible redirect that preserves query and hash in JavaScript', () => {
  const html = renderRootRedirect('/beta/')
  assert.match(html, /http-equiv="refresh" content="0; url=\/beta\/"/)
  assert.match(html, /rel="canonical" href="https:\/\/docs\.wago\.sh\/beta\/"/)
  assert.match(html, /window\.location\.search/)
  assert.match(html, /window\.location\.hash/)
  assert.match(html, /href="\/beta\/"/)
})

test('publishes root source beneath canary without moving version snapshots', () => {
  const manifest = {
    channels: [{ label: 'canary', base: '/canary' }, { label: 'beta', base: '/beta' }],
    releases: [{ label: 'v1.0.0', base: '/v1.0.0' }]
  }
  assert.equal(publishedCanaryPath(manifest, 'getting-started.md'), 'canary/getting-started.md')
  assert.equal(publishedCanaryPath(manifest, 'beta/index.md'), 'beta/index.md')
  assert.equal(publishedCanaryPath(manifest, 'v1.0.0/index.md'), 'v1.0.0/index.md')
  assert.equal(publishedCanaryPath(manifest, 'components.md'), 'components.md')
})

test('scopes legacy product links without changing shared assets or external links', () => {
  const html = '<a href="/guides/plugins">Guide</a><img src="/demos/wasi.gif"><a href="https://wago.sh">Wago</a>'
  const markdown = '[Start](/getting-started) ![Demo](/demos/run.gif)'
  assert.equal(
    scopeVersionedHtmlLinks(html, '/beta'),
    '<a href="/beta/guides/plugins">Guide</a><img src="/demos/wasi.gif"><a href="https://wago.sh">Wago</a>'
  )
  assert.equal(
    scopeVersionedMarkdownLinks(markdown, '/beta'),
    '[Start](/beta/getting-started) ![Demo](/demos/run.gif)'
  )
})
