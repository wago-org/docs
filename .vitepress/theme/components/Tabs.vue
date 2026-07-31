<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots } from 'vue'

const props = defineProps<{
  sync?: string
  defaultTab?: string
}>()

const slots = useSlots()
const activeIndex = ref(0)
const root = ref<HTMLElement>()
const id = `tabs-${useId().replace(/:/g, '')}`

const tabs = computed(() =>
  (slots.default?.() ?? []).filter(
    (node) => typeof node.props?.title === 'string'
  )
)

const storageKey = computed(() => props.sync ? `wago-docs:tab:${props.sync}` : '')

function indexForTitle(title: string | null) {
  if (!title) return -1
  return tabs.value.findIndex((tab) => tab.props?.title === title)
}

function select(index: number, focus = false, broadcast = true) {
  if (index < 0 || index >= tabs.value.length) return
  activeIndex.value = index

  const title = tabs.value[index]?.props?.title
  if (props.sync && typeof title === 'string' && typeof window !== 'undefined') {
    localStorage.setItem(storageKey.value, title)
    if (broadcast) {
      window.dispatchEvent(
        new CustomEvent('wago-tabs-change', {
          detail: { sync: props.sync, title }
        })
      )
    }
  }

  if (focus) {
    nextTick(() => {
      root.value
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        .item(index)
        ?.focus()
    })
  }
}

function onKeydown(event: KeyboardEvent, index: number) {
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.value.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.value.length) % tabs.value.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = tabs.value.length - 1
  else return

  event.preventDefault()
  select(next, true)
}

function onSyncedTab(event: Event) {
  const detail = (event as CustomEvent<{ sync?: string; title?: string }>).detail
  if (!props.sync || detail?.sync !== props.sync) return
  select(indexForTitle(detail.title ?? null), false, false)
}

onMounted(() => {
  const preferred = props.sync
    ? localStorage.getItem(storageKey.value)
    : props.defaultTab ?? null
  select(indexForTitle(preferred), false, false)
  window.addEventListener('wago-tabs-change', onSyncedTab)
})

onBeforeUnmount(() => {
  window.removeEventListener('wago-tabs-change', onSyncedTab)
})
</script>

<template>
  <div ref="root" class="wago-tabs">
    <div class="wago-tabs__list" role="tablist" aria-label="Documentation tabs">
      <button
        v-for="(tab, index) in tabs"
        :id="`${id}-tab-${index}`"
        :key="tab.props?.title"
        type="button"
        role="tab"
        :aria-controls="`${id}-panel-${index}`"
        :aria-selected="activeIndex === index"
        :tabindex="activeIndex === index ? 0 : -1"
        @click="select(index)"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.props?.title }}
      </button>
    </div>
    <div
      v-if="tabs[activeIndex]"
      :id="`${id}-panel-${activeIndex}`"
      class="wago-tabs__panel"
      role="tabpanel"
      :aria-labelledby="`${id}-tab-${activeIndex}`"
    >
      <component :is="tabs[activeIndex]" />
    </div>
  </div>
</template>
