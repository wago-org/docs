export interface DocsVersion {
  label: string
  base: string
  group: 'channel' | 'release'
  latest?: boolean
}

// Keep channels first and releases newest-first. Each non-empty base must have
// a matching docs directory; the empty base is the canary documentation.
export const docsVersions: DocsVersion[] = [
  { label: 'canary', base: '', group: 'channel' },
  { label: 'nightly', base: '/nightly', group: 'channel' },
  { label: 'v0.0.0', base: '/v0.0.0', group: 'release', latest: true }
]
