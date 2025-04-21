<script setup lang="ts">
import { UNavigationMenu } from '#components'
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Device select',
      icon: 'i-solar:usb-bold',
      to: '/',
    },
    {
      label: 'File explorer',
      icon: 'i-solar:file-linear',
      to: '/file-explorer',
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
