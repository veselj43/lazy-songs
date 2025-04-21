<script setup lang="ts">
import UsbDevices from '~/components/UsbDevices.vue'
import LayoutMain from './_partial/LayoutMain.vue'
</script>

<template>
  <LayoutMain>
    <ClientOnly>
      <UsbDevices />
    </ClientOnly>
  </LayoutMain>
</template>
