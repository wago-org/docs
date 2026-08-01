import manifestData from '../versions.json'

export interface CodeRelease {
  tag: string
  sha: string
  publishedAt: string
  docsSource: string
}

export interface DocsVersion {
  label: string
  base: string
  group: 'channel' | 'release'
  latest?: boolean
  release?: CodeRelease | null
}

interface VersionManifest {
  schemaVersion: number
  channels: Omit<DocsVersion, 'group'>[]
  releases: Omit<DocsVersion, 'group'>[]
}

const manifest = manifestData as VersionManifest

if (manifest.schemaVersion !== 1 || !manifest.channels.length) {
  throw new Error('versions.json is not a supported documentation version manifest')
}

// The JSON manifest is the release automation's source of truth. Channels stay
// first and official releases stay newest-first in the version selector.
export const docsVersions: DocsVersion[] = [
  ...manifest.channels.map((version) => ({ ...version, group: 'channel' as const })),
  ...manifest.releases.map((version) => ({ ...version, group: 'release' as const }))
]
