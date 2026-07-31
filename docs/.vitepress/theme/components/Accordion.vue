<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ title: string; id?: string; open?: boolean }>()
const details = ref<HTMLDetailsElement>()
const resolvedId = computed(() =>
  props.id ?? props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
)

function openFromHash() {
  if (decodeURIComponent(window.location.hash.slice(1)) === resolvedId.value && details.value) {
    details.value.open = true
  }
}

onMounted(() => {
  openFromHash()
  window.addEventListener('hashchange', openFromHash)
})

onBeforeUnmount(() => window.removeEventListener('hashchange', openFromHash))
</script>

<template>
  <details :id="resolvedId" ref="details" class="wago-accordion" :open="open">
    <summary>
      <span>{{ title }}</span>
      <span class="wago-accordion__actions">
        <a
          class="wago-accordion__anchor"
          :href="`#${resolvedId}`"
          :aria-label="`Link to ${title}`"
          title="Copy link"
          @click.stop
        >#</a>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </summary>
    <div class="wago-accordion__body"><slot /></div>
  </details>
</template>
