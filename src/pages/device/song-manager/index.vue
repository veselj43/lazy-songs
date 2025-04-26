<script setup lang="ts">
import AdbProvider from '~/components/AdbProvider.vue'
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import PlaylistUpload from './_partial/PlaylistUpload.vue'
import SongList from './_partial/SongList.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})
</script>

<template>
  <LayoutMain width="wide">
    <AdbProvider>
      <div class="m-10 grid grid-cols-2 gap-10">
        <SongList />

        <PlaylistUpload />
      </div>
    </AdbProvider>
  </LayoutMain>
</template>
