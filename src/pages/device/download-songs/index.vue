<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import PlaylistDownload from './_partial/PlaylistDownload.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})

useHead({
  title: 'Download songs',
})
</script>

<template>
  <LayoutMain :scrollable="true">
    <PlaylistDownload />
  </LayoutMain>
</template>
