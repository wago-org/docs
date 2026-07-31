<script setup lang="ts">
withDefaults(
  defineProps<{
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
  }>(),
  { method: 'GET' }
)
</script>

<template>
  <div class="wago-endpoint">
    <span class="wago-endpoint__method" :data-method="method">{{ method }}</span>
    <code>{{ path }}</code>
    <span class="wago-endpoint__description"><slot /></span>
  </div>
</template>
