<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title: string; href?: string; icon?: string }>()
const external = computed(() => Boolean(props.href?.match(/^https?:\/\//)))
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    class="wago-card"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <span v-if="icon" class="wago-card__icon" aria-hidden="true">{{ icon }}</span>
    <div class="wago-card__body">
      <div class="wago-card__title">
        {{ title }}
        <span v-if="href" class="wago-card__arrow" aria-hidden="true">→</span>
      </div>
      <div class="wago-card__content"><slot /></div>
    </div>
  </component>
</template>
