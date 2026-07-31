<script setup lang="ts">
defineProps<{ columns: string[] }>()
</script>

<template>
  <div class="wago-comparison" role="table">
    <div class="wago-comparison__inner" :style="{ '--wago-compare-columns': columns.length }">
      <div class="wago-comparison__header" role="row">
        <span role="columnheader">Feature</span>
        <span v-for="column in columns" :key="column" role="columnheader">{{ column }}</span>
      </div>
      <slot />
    </div>
  </div>
</template>
