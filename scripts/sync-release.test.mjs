import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { syncRelease } from './sync-release.mjs'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'wago-docs-sync-'))
  await mkdir(join(root, 'reference'))
  await writeFile(join(root, 'index.md'), '# Canary\n')
  await writeFile(join(root, 'getting-started.md'), '# Start\n')
  await writeFile(join(root, 'reference', 'configuration.md'), '# Configuration\n')
  await writeFile(join(root, 'README.md'), '# Repository\n')
  await writeFile(join(root, 'components.md'), '# Internal showcase\n')
  await writeFile(join(root, 'versions.json'), `${JSON.stringify({
    schemaVersion: 1,
    channels: [
      { label: 'canary', base: '', release: null },
      { label: 'nightly', base: '/nightly', release: null }
    ],
    releases: [
      { label: 'v0.0.0', base: '/v0.0.0', latest: true, release: null }
    ]
  }, null, 2)}\n`)
  return root
}

const release = {
  tag: 'nightly-20260731-aaaaaaaa',
  sha: 'a'.repeat(40),
  publishedAt: '2026-07-31T06:00:00Z',
  docsSource: 'docs-commit'
}

test('promotes canary to nightly and the matching nightly to stable', async () => {
  const root = await fixture()
  try {
    const canary = { ...release, tag: 'canary-aaaaaaa' }
    assert.equal((await syncRelease({ channel: 'canary', release: canary, root })).changed, true)
    assert.equal((await syncRelease({ channel: 'nightly', release, root })).changed, true)
    assert.equal(await readFile(join(root, 'nightly', 'index.md'), 'utf8'), '# Canary\n')
    await assert.rejects(readFile(join(root, 'nightly', 'README.md')), { code: 'ENOENT' })
    await assert.rejects(readFile(join(root, 'nightly', 'components.md')), { code: 'ENOENT' })

    const stable = { ...release, tag: 'v1.2.3' }
    assert.equal((await syncRelease({ channel: 'release', release: stable, root })).changed, true)
    assert.equal(await readFile(join(root, 'v1.2.3', 'index.md'), 'utf8'), '# Canary\n')
    const manifest = JSON.parse(await readFile(join(root, 'versions.json'), 'utf8'))
    assert.equal(manifest.releases[0].label, 'v1.2.3')
    assert.equal(manifest.releases[0].latest, true)
    assert.equal(manifest.releases[1].latest, false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('refuses stable docs without an exact nightly snapshot', async () => {
  const root = await fixture()
  try {
    await assert.rejects(
      syncRelease({
        channel: 'release',
        release: {
          tag: 'v1.0.0',
          sha: 'b'.repeat(40),
          publishedAt: '2026-07-31T07:00:00Z'
        },
        root
      }),
      /no nightly documentation snapshot/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('does not roll a channel back when an older event arrives late', async () => {
  const root = await fixture()
  try {
    await syncRelease({ channel: 'canary', release: { ...release, tag: 'canary-aaaaaaa' }, root })
    const result = await syncRelease({
      channel: 'canary',
      release: {
        tag: 'canary-bbbbbbb',
        sha: 'b'.repeat(40),
        publishedAt: '2026-07-30T06:00:00Z'
      },
      root
    })
    assert.deepEqual(result, { changed: false, reason: 'stale' })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
