<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import PlaylistList from './_partial/PlaylistList.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})
</script>

<template>
  <LayoutMain>
    <PlaylistList />
  </LayoutMain>
</template>
