<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const channel = computed(() => {
  if (route.path === '/nightly' || route.path.startsWith('/nightly/')) return 'nightly'
  if (route.path === '/v0.0.0' || route.path.startsWith('/v0.0.0/')) return null
  return 'canary'
})
</script>

<template>
  <aside v-if="channel" class="wago-version-banner" :data-channel="channel">
    <span class="wago-version-banner__signal" aria-hidden="true" />
    <span>
      <strong>{{ channel }}</strong>
      documentation tracks unreleased changes and may change without notice.
    </span>
    <a href="/v0.0.0/">View latest release →</a>
  </aside>
</template>
