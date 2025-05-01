<script setup lang="ts">
import AdbProvider from '~/components/AdbProvider.vue'
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
    <AdbProvider>
      <SongList />
    </AdbProvider>
  </LayoutMain>
</template>
