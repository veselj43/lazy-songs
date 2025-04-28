<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import PlaylistDownload from './_partial/PlaylistDownload.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})
</script>

<template>
  <LayoutMain>
    <PlaylistDownload />
  </LayoutMain>
</template>
