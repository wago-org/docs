import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptRoot = resolve(process.env.DOCS_ROOT || dirname(fileURLToPath(import.meta.url)), process.env.DOCS_ROOT ? '.' : '..')
const SHA_PATTERN = /^[0-9a-f]{40}$/
const STABLE_TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/
const SKIPPED_FILES = new Set(['README.md', 'components.md'])
const SKIPPED_DIRECTORIES = new Set([
  '.docs-snapshots',
  '.git',
  '.github',
  '.vitepress',
  'node_modules',
  'public',
  'scripts'
])

function assertRelease(release) {
  if (!release || typeof release !== 'object') throw new Error('Release metadata is required')
  if (!SHA_PATTERN.test(release.sha)) throw new Error(`Invalid Wago commit SHA: ${release.sha}`)
  if (!release.tag) throw new Error('A Wago release tag is required')
  if (!Number.isFinite(Date.parse(release.publishedAt))) {
    throw new Error(`Invalid release publication date: ${release.publishedAt}`)
  }
}

function semverParts(label) {
  const match = STABLE_TAG_PATTERN.exec(label)
  if (!match) throw new Error(`Stable documentation requires a vMAJOR.MINOR.PATCH tag: ${label}`)
  return match.slice(1).map(Number)
}

function compareSemverDescending(a, b) {
  const left = semverParts(a.label)
  const right = semverParts(b.label)
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return right[index] - left[index]
  }
  return 0
}

async function readManifest(root) {
  const manifest = JSON.parse(await readFile(join(root, 'versions.json'), 'utf8'))
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.channels) || !Array.isArray(manifest.releases)) {
    throw new Error('versions.json is not a supported documentation version manifest')
  }
  return manifest
}

async function writeManifest(root, manifest) {
  await writeFile(join(root, 'versions.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}

async function collectSourceFiles(root, manifest) {
  const releaseDirectories = new Set(
    manifest.releases.map(({ base }) => base.replace(/^\//, '')).filter(Boolean)
  )
  const channelDirectories = new Set(
    manifest.channels.map(({ base }) => base.replace(/^\//, '')).filter(Boolean)
  )
  const files = []

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name)
      const path = relative(root, absolute).split(sep).join('/')
      const topLevel = path.split('/')[0]

      if (entry.isSymbolicLink()) throw new Error(`Documentation snapshots do not follow symlinks: ${path}`)
      if (entry.isDirectory()) {
        if (
          SKIPPED_DIRECTORIES.has(topLevel) ||
          releaseDirectories.has(topLevel) ||
          channelDirectories.has(topLevel)
        ) continue
        await visit(absolute)
      } else if (entry.isFile() && path.endsWith('.md') && !SKIPPED_FILES.has(path)) {
        files.push(path)
      }
    }
  }

  await visit(root)
  return files.sort()
}

async function replaceTree(root, destination, sourceFiles, metadata) {
  const temporaryParent = await mkdtemp(join(root, '.docs-sync-'))
  const temporaryTree = join(temporaryParent, 'tree')
  await mkdir(temporaryTree)

  try {
    for (const path of sourceFiles) {
      const target = join(temporaryTree, path)
      await mkdir(dirname(target), { recursive: true })
      await cp(join(root, path), target)
    }
    if (metadata) {
      await writeFile(join(temporaryTree, 'snapshot.json'), `${JSON.stringify(metadata, null, 2)}\n`)
    }
    await rm(destination, { recursive: true, force: true })
    await mkdir(dirname(destination), { recursive: true })
    await rename(temporaryTree, destination)
  } finally {
    await rm(temporaryParent, { recursive: true, force: true })
  }
}

async function copySnapshot(root, source, destination) {
  const temporaryParent = await mkdtemp(join(root, '.docs-sync-'))
  const temporaryTree = join(temporaryParent, 'tree')
  try {
    await cp(source, temporaryTree, {
      recursive: true,
      filter: (path) => !path.endsWith(`${sep}snapshot.json`)
    })
    await rm(destination, { recursive: true, force: true })
    await rename(temporaryTree, destination)
  } finally {
    await rm(temporaryParent, { recursive: true, force: true })
  }
}

function isOlderThanCurrent(current, incoming) {
  return current?.publishedAt && Date.parse(incoming.publishedAt) < Date.parse(current.publishedAt)
}

export async function syncRelease({ channel, release, root = scriptRoot }) {
  assertRelease(release)
  const manifest = await readManifest(root)
  const docsSource = release.docsSource || process.env.DOCS_SOURCE_SHA || 'working-tree'
  const recordedRelease = { ...release, docsSource }

  if (channel === 'canary') {
    const canary = manifest.channels.find(({ label }) => label === 'canary')
    if (!canary) throw new Error('versions.json does not define the canary channel')
    if (isOlderThanCurrent(canary.release, recordedRelease)) return { changed: false, reason: 'stale' }
    if (JSON.stringify(canary.release) === JSON.stringify(recordedRelease)) return { changed: false, reason: 'current' }
    canary.release = recordedRelease
    await writeManifest(root, manifest)
    return { changed: true, reason: 'canary-updated' }
  }

  if (channel === 'nightly') {
    const nightly = manifest.channels.find(({ label }) => label === 'nightly')
    if (!nightly) throw new Error('versions.json does not define the nightly channel')
    if (isOlderThanCurrent(nightly.release, recordedRelease)) return { changed: false, reason: 'stale' }

    const sourceFiles = await collectSourceFiles(root, manifest)
    if (!sourceFiles.includes('index.md')) throw new Error('Canary documentation has no index.md')
    const snapshot = join(root, '.docs-snapshots', release.sha)
    const snapshotMetadata = { schemaVersion: 1, release: recordedRelease, files: sourceFiles }

    try {
      const existing = JSON.parse(await readFile(join(snapshot, 'snapshot.json'), 'utf8'))
      if (existing.release.sha !== release.sha || existing.release.tag !== release.tag) {
        throw new Error(`Snapshot ${release.sha} already exists with different provenance`)
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await replaceTree(root, snapshot, sourceFiles, snapshotMetadata)
    }

    if (JSON.stringify(nightly.release) === JSON.stringify(recordedRelease)) {
      return { changed: false, reason: 'current' }
    }
    await copySnapshot(root, snapshot, join(root, 'nightly'))
    nightly.release = recordedRelease
    await writeManifest(root, manifest)
    return { changed: true, reason: 'nightly-promoted' }
  }

  if (channel === 'release') {
    semverParts(release.tag)
    const snapshot = join(root, '.docs-snapshots', release.sha)
    let snapshotMetadata
    try {
      snapshotMetadata = JSON.parse(await readFile(join(snapshot, 'snapshot.json'), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          `Stable ${release.tag} targets ${release.sha}, but that commit has no nightly documentation snapshot`
        )
      }
      throw error
    }
    if (snapshotMetadata.release.sha !== release.sha) {
      throw new Error(`Nightly snapshot provenance does not match ${release.sha}`)
    }
    const promotedRelease = {
      ...recordedRelease,
      docsSource: snapshotMetadata.release.docsSource
    }

    const existing = manifest.releases.find(({ label }) => label === release.tag)
    if (existing?.release && existing.release.sha !== release.sha) {
      throw new Error(`Stable documentation ${release.tag} is immutable and already targets ${existing.release.sha}`)
    }
    if (existing?.release && JSON.stringify(existing.release) === JSON.stringify(promotedRelease)) {
      return { changed: false, reason: 'current' }
    }

    await copySnapshot(root, snapshot, join(root, release.tag))
    if (existing) {
      existing.base = `/${release.tag}`
      existing.release = promotedRelease
    } else {
      manifest.releases.push({
        label: release.tag,
        base: `/${release.tag}`,
        latest: false,
        release: promotedRelease
      })
    }
    manifest.releases.sort(compareSemverDescending)
    manifest.releases.forEach((version, index) => { version.latest = index === 0 })
    await writeManifest(root, manifest)
    return { changed: true, reason: 'release-promoted' }
  }

  throw new Error(`Unknown documentation release channel: ${channel}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [channel, tag, sha, publishedAt] = process.argv.slice(2)
  const result = await syncRelease({ channel, release: { tag, sha, publishedAt } })
  console.log(`${result.changed ? 'Updated' : 'Skipped'} ${channel} documentation: ${result.reason}`)
}
