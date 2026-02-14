<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import SongList from './_partial/SongList.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})

useHead({
  title: 'Song manager',
})
</script>

<template>
  <LayoutMain>
    <SongList />
  </LayoutMain>
</template>
