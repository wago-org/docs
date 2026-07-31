<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="wago-step">
    <div class="wago-step__marker" aria-hidden="true" />
    <div class="wago-step__body">
      <h3>{{ title }}</h3>
      <slot />
    </div>
  </section>
</template>
