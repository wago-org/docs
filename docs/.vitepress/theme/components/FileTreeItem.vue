<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    type?: 'file' | 'folder'
    comment?: string
  }>(),
  { type: 'file' }
)
</script>

<template>
  <li class="wago-file-tree__item" :data-type="type">
    <div class="wago-file-tree__row">
      <span class="wago-file-tree__icon" aria-hidden="true">{{ type === 'folder' ? '▾' : '·' }}</span>
      <code>{{ name }}</code>
      <span v-if="comment" class="wago-file-tree__comment">{{ comment }}</span>
    </div>
    <ul v-if="$slots.default"><slot /></ul>
  </li>
</template>
