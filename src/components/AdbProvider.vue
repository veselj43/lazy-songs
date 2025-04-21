<script setup lang="ts">
import { provideAdbCurrent } from '~/service/adb.provider'
import { useAdbStore } from '~/store/adb'

const storeAdb = useAdbStore()
const { deviceAdb } = storeToRefs(storeAdb)

provideAdbCurrent(deviceAdb)
</script>

<template>
  <ClientOnly>
    <div v-if="!deviceAdb">
      <UAlert
        color="error"
        variant="soft"
        title="Select your device first."
      />
    </div>

    <slot v-else />
  </ClientOnly>
</template>
