<script setup lang="ts">
import { middlewareAdbDeviceCheck } from '~/pages/_partial/adb.middleware'
import LayoutMain from '~/pages/_partial/LayoutMain.vue'
import ConfigUpdate from './_partial/ConfigUpdate.vue'

definePageMeta({
  middleware: [middlewareAdbDeviceCheck],
})
</script>

<template>
  <LayoutMain>
    <ConfigUpdate />
  </LayoutMain>
</template>
