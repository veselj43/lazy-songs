<script setup lang="ts">
import { UNavigationMenu } from '#components'
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Download songs',
      icon: 'i-solar:download-square-linear',
      to: '/device/download-songs',
    },
    {
      label: 'Song manager',
      icon: 'i-solar:music-library-linear',
      to: '/device/song-manager',
    },
    {
      label: 'File explorer',
      icon: 'i-solar:file-linear',
      to: '/device/file-explorer',
    },
  ],
])
</script>

<template>
  <div class="flex flex-col p-2">
    <div class="text-secondary-300 p-2">LazySongs</div>

    <UNavigationMenu
      orientation="vertical"
      :items="items"
    />
  </div>
</template>
