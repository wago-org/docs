<script setup lang="ts">
withDefaults(
  defineProps<{ tone?: 'lilac' | 'green' | 'pink' | 'muted' }>(),
  { tone: 'lilac' }
)
</script>

<template>
  <span class="wago-badge" :class="`wago-badge--${tone}`"><slot /></span>
</template>
