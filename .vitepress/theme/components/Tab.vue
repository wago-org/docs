<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="wago-tab-content"><slot /></div>
</template>
