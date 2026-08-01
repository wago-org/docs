import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncRelease } from './sync-release.mjs'

const repository = 'wago-org/wago'
const apiRoot = `https://api.github.com/repos/${repository}`
const token = process.env.GITHUB_TOKEN
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'wago-docs-release-sync',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
}

async function github(path) {
  const response = await fetch(`${apiRoot}${path}`, { headers })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}: ${await response.text()}`)
  return response.json()
}

async function normalizeRelease(release) {
  const commit = await github(`/commits/${encodeURIComponent(release.target_commitish)}`)
  return {
    tag: release.tag_name,
    sha: commit.sha,
    publishedAt: release.published_at
  }
}

function channelFor(release) {
  if (release.prerelease && /^canary-[0-9a-f]{7}$/.test(release.tag_name)) return 'canary'
  if (release.prerelease && /^nightly-\d{8}-[0-9a-f]{7}$/.test(release.tag_name)) return 'nightly'
  if (!release.prerelease && /^v\d+\.\d+\.\d+$/.test(release.tag_name)) return 'release'
  return null
}

async function sync(channel, release) {
  const normalized = await normalizeRelease(release)
  const result = await syncRelease({ channel, release: normalized })
  console.log(`${result.changed ? 'Updated' : 'Skipped'} ${channel} ${normalized.tag}: ${result.reason}`)
  return result.changed
}

export async function reconcileRequestedRelease({ channel, tag, sha }) {
  const release = await github(`/releases/tags/${encodeURIComponent(tag)}`)
  const actualChannel = channelFor(release)
  if (actualChannel !== channel) {
    throw new Error(`Release ${tag} belongs to ${actualChannel || 'no supported channel'}, not ${channel}`)
  }
  const normalized = await normalizeRelease(release)
  if (sha && normalized.sha !== sha) {
    throw new Error(`Dispatch SHA ${sha} does not match ${tag} at ${normalized.sha}`)
  }
  const result = await syncRelease({ channel, release: normalized })
  console.log(`${result.changed ? 'Updated' : 'Skipped'} ${channel} ${tag}: ${result.reason}`)
  return result.changed
}

export async function reconcileLatestReleases() {
  const releases = await github('/releases?per_page=100')
  const supported = releases.filter((release) => !release.draft && channelFor(release))
  const byPublishedAt = (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at)
  const canary = supported.filter((release) => channelFor(release) === 'canary').sort(byPublishedAt)[0]
  const nightly = supported.filter((release) => channelFor(release) === 'nightly').sort(byPublishedAt)[0]
  const stable = supported
    .filter((release) => channelFor(release) === 'release')
    .sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at))

  let changed = false
  if (canary) changed = (await sync('canary', canary)) || changed
  if (nightly) changed = (await sync('nightly', nightly)) || changed
  for (const release of stable) changed = (await sync('release', release)) || changed
  return changed
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const channel = process.env.DOCS_RELEASE_CHANNEL
  const tag = process.env.DOCS_RELEASE_TAG
  const sha = process.env.DOCS_RELEASE_SHA
  const changed = channel
    ? await reconcileRequestedRelease({ channel, tag, sha })
    : await reconcileLatestReleases()
  if (process.env.GITHUB_OUTPUT) {
    const { appendFile } = await import('node:fs/promises')
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
  }
}
