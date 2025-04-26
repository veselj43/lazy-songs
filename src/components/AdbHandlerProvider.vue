<script setup lang="ts">
import { provideAdbHandler } from '~/service/adb.provider'
import { useAdbStore } from '~/store/adb'

const storeAdb = useAdbStore()

if (storeAdb.handler) {
  provideAdbHandler(storeAdb.handler)
}
</script>

<template>
  <div v-if="!storeAdb.handler">
    <UAlert
      color="error"
      variant="soft"
      title="Unable to find USB interface. Your browser probably doesn't support it."
    />
  </div>

  <slot v-else />
</template>
