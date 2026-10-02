<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { docsVersions } from '../../versions'

const route = useRoute()

const activeVersion = computed(
  () =>
    docsVersions.find(
      ({ base }) => base && (route.path === base || route.path.startsWith(`${base}/`))
    ) ?? docsVersions[0]
)
const latestRelease = computed(() => docsVersions.find(({ group, latest }) => group === 'release' && latest))
const codeUrl = computed(() => {
  const release = activeVersion.value.release
  return release ? `https://github.com/wago-org/wago/tree/${release.sha}` : null
})
</script>

<template>
  <aside
    v-if="activeVersion.group === 'channel' || activeVersion.release"
    class="wago-version-banner"
    :data-channel="activeVersion.group === 'channel' ? activeVersion.label : 'release'"
  >
    <span class="wago-version-banner__signal" aria-hidden="true" />
    <span v-if="activeVersion.group === 'channel'">
      <strong>{{ activeVersion.label }}</strong>
      <template v-if="activeVersion.label === 'canary'">
        documentation tracks development source. Follow each guide's stated runtime or Go dependency;
        selecting docs does not switch your installed runtime.
      </template>
      <template v-else>documentation tracks unreleased changes and may change without notice.</template>
    </span>
    <span v-else>
      Documentation snapshot for <strong>{{ activeVersion.label }}</strong>.
    </span>
    <a v-if="codeUrl" :href="codeUrl">
      {{ activeVersion.group === 'channel' && activeVersion.label === 'canary' ? 'Last recorded canary' : 'Wago' }}
      {{ activeVersion.release?.sha.slice(0, 7) }} →
    </a>
    <a v-else-if="latestRelease" :href="`${latestRelease.base}/`">View latest release →</a>
  </aside>
</template>
