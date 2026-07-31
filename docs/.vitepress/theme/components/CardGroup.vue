<script setup lang="ts">
withDefaults(defineProps<{ columns?: 2 | 3 }>(), { columns: 2 })
</script>

<template>
  <div class="wago-card-group" :style="{ '--wago-card-columns': columns }"><slot /></div>
</template>
