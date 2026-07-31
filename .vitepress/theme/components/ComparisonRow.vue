<script setup lang="ts">
defineProps<{ feature: string; values: string[] }>()
</script>

<template>
  <div class="wago-comparison__row" role="row">
    <strong role="rowheader">{{ feature }}</strong>
    <span v-for="(value, index) in values" :key="index" role="cell">{{ value }}</span>
  </div>
</template>
