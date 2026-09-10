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
      { label: 'beta', base: '/beta', release: null }
    ],
    releases: []
  }, null, 2)}\n`)
  return root
}

const release = {
  tag: 'v1.2.3-beta.1',
  sha: 'a'.repeat(40),
  publishedAt: '2026-07-31T06:00:00Z',
  docsSource: 'docs-commit'
}

test('promotes canary to beta and the matching beta to stable', async () => {
  const root = await fixture()
  try {
    const canary = { ...release, tag: `v1.2.3-canary.g${'a'.repeat(7)}` }
    assert.equal((await syncRelease({ channel: 'canary', release: canary, root })).changed, true)
    assert.equal((await syncRelease({ channel: 'beta', release, root })).changed, true)
    assert.equal(await readFile(join(root, 'beta', 'index.md'), 'utf8'), '# Canary\n')
    await assert.rejects(readFile(join(root, 'beta', 'README.md')), { code: 'ENOENT' })
    await assert.rejects(readFile(join(root, 'beta', 'components.md')), { code: 'ENOENT' })

    const stable = { ...release, tag: 'v1.2.3' }
    assert.equal((await syncRelease({ channel: 'release', release: stable, root })).changed, true)
    assert.equal(await readFile(join(root, 'v1.2.3', 'index.md'), 'utf8'), '# Canary\n')
    const manifest = JSON.parse(await readFile(join(root, 'versions.json'), 'utf8'))
    assert.equal(manifest.releases[0].label, 'v1.2.3')
    assert.equal(manifest.releases[0].latest, true)
    assert.equal(manifest.releases.length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('refuses stable docs without an exact beta snapshot', async () => {
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
      /no beta documentation snapshot/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('refreshes a beta snapshot when docs change for the same code commit', async () => {
  const root = await fixture()
  try {
    await syncRelease({ channel: 'beta', release, root })
    await writeFile(join(root, 'index.md'), '# Refreshed canary\n')

    const refreshed = {
      ...release,
      tag: 'v1.2.3-beta.2',
      publishedAt: '2026-07-31T07:00:00Z',
      docsSource: 'new-docs-commit'
    }
    assert.equal((await syncRelease({ channel: 'beta', release: refreshed, root })).changed, true)
    assert.equal(await readFile(join(root, 'beta', 'index.md'), 'utf8'), '# Refreshed canary\n')

    const snapshot = JSON.parse(
      await readFile(join(root, '.docs-snapshots', release.sha, 'snapshot.json'), 'utf8')
    )
    assert.equal(snapshot.release.docsSource, 'new-docs-commit')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('does not roll a channel back when an older event arrives late', async () => {
  const root = await fixture()
  try {
    await syncRelease({ channel: 'canary', release: { ...release, tag: `v1.2.3-canary.g${'a'.repeat(7)}` }, root })
    const result = await syncRelease({
      channel: 'canary',
      release: {
        tag: `v1.2.3-canary.g${'b'.repeat(7)}`,
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
