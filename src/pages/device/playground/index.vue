<script setup lang="ts">
import AdbProvider from '~/components/AdbProvider.vue'
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '../../_partial/LayoutMain.vue'
import AdbPlayground from './_partial/AdbPlayground.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})
</script>

<template>
  <LayoutMain>
    <AdbProvider>
      <AdbPlayground />
    </AdbProvider>
  </LayoutMain>
</template>
