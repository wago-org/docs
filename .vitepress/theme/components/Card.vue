<script setup lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCode, faPlay, faPlug, faRightLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'

const props = defineProps<{ title: string; href?: string; icon?: string }>()
const external = computed(() => Boolean(props.href?.match(/^https?:\/\//)))
const fontAwesomeIcons: Record<string, IconDefinition> = {
  'fa-code': faCode,
  'fa-play': faPlay,
  'fa-plug': faPlug,
  'fa-right-left': faRightLeft
}
const fontAwesomeIcon = computed(() => props.icon ? fontAwesomeIcons[props.icon] : undefined)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    class="wago-card"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <span v-if="icon" class="wago-card__icon" aria-hidden="true">
      <FontAwesomeIcon v-if="fontAwesomeIcon" :icon="fontAwesomeIcon" fixed-width />
      <template v-else>{{ icon }}</template>
    </span>
    <div class="wago-card__body">
      <div class="wago-card__title">
        {{ title }}
        <span v-if="href" class="wago-card__arrow" aria-hidden="true">→</span>
      </div>
      <div class="wago-card__content"><slot /></div>
    </div>
  </component>
</template>
