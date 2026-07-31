<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import VersionSwitcher from './VersionSwitcher.vue'
import VersionBanner from './components/VersionBanner.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <div class="wago-sparkles" aria-hidden="true">
    <span style="top: 13%; left: 5%; font-size: 13px; animation-delay: -0.7s">✦</span>
    <span style="top: 29%; right: 6%; font-size: 19px; animation-delay: -2.4s">✦</span>
    <span style="top: 48%; left: 3%; font-size: 8px; animation-delay: -1.5s">✦</span>
    <span style="top: 67%; right: 4%; font-size: 11px; animation-delay: -3.1s">✦</span>
    <span style="top: 84%; left: 7%; font-size: 17px; animation-delay: -2s">✦</span>
  </div>
  <Layout>
    <template #nav-bar-title-after>
      <span class="wago-product-tag">docs</span>
    </template>
    <template #sidebar-nav-before>
      <VersionSwitcher />
    </template>
    <template #doc-before>
      <VersionBanner />
    </template>
  </Layout>
</template>
