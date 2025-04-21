<script setup lang="ts">
import AdbDeviceSelect from '~/components/AdbDeviceSelect.vue'
import AdbHandlerProvider from '~/components/AdbHandlerProvider.vue'
import LayoutMain from './_partial/LayoutMain.vue'
</script>

<template>
  <LayoutMain>
    <AdbHandlerProvider>
      <AdbDeviceSelect />
    </AdbHandlerProvider>
  </LayoutMain>
</template>
