<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { docsVersions, type DocsVersion } from '../versions'

const route = useRoute()

const versionGroups = [
  {
    label: 'Channels',
    versions: docsVersions.filter(({ group }) => group === 'channel')
  },
  {
    label: 'Official versions',
    versions: docsVersions.filter(({ group }) => group === 'release')
  }
]

const activeVersion = computed(
  () =>
    docsVersions.find(
      ({ base }) => base && (route.path === base || route.path.startsWith(`${base}/`))
    ) ?? docsVersions[0]
)

function versionHref(version: DocsVersion) {
  const currentBase = activeVersion.value.base
  const pagePath = currentBase
    ? route.path.slice(currentBase.length) || '/'
    : route.path
  const normalizedPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`

  return withBase(`${version.base}${normalizedPath}` || '/')
}
</script>

<template>
  <details class="version-switcher">
    <summary>
      <span>{{ activeVersion.label.toLowerCase() }}</span>
      <svg
        class="version-switcher__chevron"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </summary>
    <div class="version-switcher__menu">
      <div
        v-for="group in versionGroups"
        :key="group.label"
        class="version-switcher__group"
      >
        <div class="version-switcher__group-label">{{ group.label }}</div>
        <a
          v-for="version in group.versions"
          :key="version.label"
          :href="versionHref(version)"
          :aria-current="version === activeVersion ? 'page' : undefined"
        >
          <span>{{ version.label }}</span>
          <span
            v-if="version.latest || version === activeVersion"
            class="version-switcher__version-meta"
          >
            <span v-if="version.latest" class="version-switcher__latest">latest</span>
            <span v-if="version === activeVersion" aria-hidden="true">✓</span>
          </span>
        </a>
      </div>
    </div>
  </details>
</template>
