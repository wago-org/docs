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
  // target_commitish is commonly the mutable branch name even when the release
  // was created from an immutable tag. Resolve the tag itself so documentation
  // provenance cannot drift when that branch advances.
  const commit = await github(`/commits/${encodeURIComponent(release.tag_name)}`)
  return {
    tag: release.tag_name,
    sha: commit.sha,
    publishedAt: release.published_at
  }
}

async function normalizeCanaryTag(tag, sha) {
  const commit = await github(`/commits/${encodeURIComponent(sha)}`)
  if (!commit.sha.startsWith(tag.slice(-7))) {
    throw new Error(`Canary tag ${tag} does not match ${commit.sha}`)
  }
  return {
    tag,
    sha: commit.sha,
    publishedAt: commit.commit?.committer?.date || commit.commit?.author?.date
  }
}

function channelFor(release) {
  if (release.prerelease && /^v\d+\.\d+\.\d+-beta\.(0|[1-9]\d*)$/.test(release.tag_name)) return 'beta'
  if (!release.prerelease && /^v\d+\.\d+\.\d+$/.test(release.tag_name)) return 'release'
  return null
}

function isCanaryTag(tag) {
  return /^v\d+\.\d+\.\d+-canary\.g[0-9a-f]{7}$/.test(tag)
}

async function sync(channel, release) {
  const normalized = await normalizeRelease(release)
  const result = await syncRelease({ channel, release: normalized })
  console.log(`${result.changed ? 'Updated' : 'Skipped'} ${channel} ${normalized.tag}: ${result.reason}`)
  return result.changed
}

export async function reconcileRequestedRelease({ channel, tag, sha }) {
	if (channel === 'canary') {
		if (!isCanaryTag(tag)) throw new Error(`Tag ${tag} is not a supported canary tag`)
		const ref = await github(`/git/ref/tags/${encodeURIComponent(tag)}`)
		if (ref.object?.type !== 'commit') throw new Error(`Canary tag ${tag} is not a lightweight commit tag`)
		const normalized = await normalizeCanaryTag(tag, ref.object.sha)
		if (sha && normalized.sha !== sha) {
			throw new Error(`Dispatch SHA ${sha} does not match ${tag} at ${normalized.sha}`)
		}
		const result = await syncRelease({ channel, release: normalized })
		console.log(`${result.changed ? 'Updated' : 'Skipped'} ${channel} ${tag}: ${result.reason}`)
		return result.changed
	}
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
	const [tags, commits, releases] = await Promise.all([
		github('/tags?per_page=100&page=1'),
		github('/commits?sha=main&per_page=100&page=1'),
		github('/releases?per_page=100')
	])
  const supported = releases.filter((release) => !release.draft && channelFor(release))
  const byPublishedAt = (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at)
	const canaryByCommit = new Map(tags.filter(({ name }) => isCanaryTag(name)).map((tag) => [tag.commit.sha, tag]))
	const canary = commits.map(({ sha }) => canaryByCommit.get(sha)).find(Boolean)
  const beta = supported.filter((release) => channelFor(release) === 'beta').sort(byPublishedAt)[0]
  const stable = supported
    .filter((release) => channelFor(release) === 'release')
    .sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at))

  let changed = false
	if (canary) {
		const normalized = await normalizeCanaryTag(canary.name, canary.commit.sha)
		const result = await syncRelease({ channel: 'canary', release: normalized })
		console.log(`${result.changed ? 'Updated' : 'Skipped'} canary ${normalized.tag}: ${result.reason}`)
		changed = result.changed || changed
	}
  if (beta) changed = (await sync('beta', beta)) || changed
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
