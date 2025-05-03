<script setup lang="ts">
import { UNavigationMenu } from '#components'
import type { NavigationMenuItem } from '@nuxt/ui'

const config = useRuntimeConfig()

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Download songs',
      icon: 'i-lucide:file-down',
      to: '/device/download-songs',
    },
    {
      label: 'Playlist manager',
      icon: 'i-lucide:file-stack',
      to: '/device/playlist-manager',
    },
    {
      label: 'Song manager',
      icon: 'i-lucide:file-music',
      to: '/device/song-manager',
    },

    ...(config.public.showFileExplorer
      ? [
          {
            label: 'File explorer',
            icon: 'i-lucide:file-question',
            to: '/device/file-explorer',
          },
        ]
      : []),
  ],
  [
    {
      label: 'Settings',
      icon: 'i-lucide:cog',
      to: '/device/settings',
    },
  ],
  [
    {
      label: 'Select device',
      icon: 'i-lucide:usb',
      to: '/',
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
