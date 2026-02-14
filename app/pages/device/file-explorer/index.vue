<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '../../_partial/LayoutMain.vue'
import AdbFileExplorer from './_partial/AdbFileExplorer.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})

useHead({
  title: 'File explorer',
})
</script>

<template>
  <LayoutMain>
    <AdbFileExplorer />
  </LayoutMain>
</template>
