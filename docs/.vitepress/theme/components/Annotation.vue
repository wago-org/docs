<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <li class="wago-annotation">
    <span class="wago-annotation__marker" aria-hidden="true" />
    <div>
      <strong v-if="title">{{ title }}</strong>
      <slot />
    </div>
  </li>
</template>
