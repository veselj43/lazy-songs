<script setup lang="ts">
import { UAlert } from '#components'
import type { AdbDeviceUiItem } from '~/lib/webUsbAdb'
import { useAdbStore } from '~/store/adb'

const router = useRouter()
const storeAdb = useAdbStore()
const adbHandler = storeAdb.handler

const devicesData = useAsyncData<AdbDeviceUiItem[]>('devices', async () => {
  if (!adbHandler) return []
  return await adbHandler.deviceGetList()
})

const deviceList = computed(() => {
  return devicesData.status.value === 'success' && devicesData.data.value ? devicesData.data.value : []
})

const deviceSelect = async (_device?: AdbDeviceUiItem) => {
  if (!adbHandler) return

  const device = _device ?? (await adbHandler.deviceRequest())
  await storeAdb.deviceSelect(device)

  if (storeAdb.deviceAdb) {
    router.push('/device/download-songs')
  }
}

onBeforeMount(() => {
  storeAdb.deviceSelect()
})
</script>

<template>
  <div class="w-full">
    <div v-if="storeAdb.deviceConnectState !== 'initial'">
      <UAlert
        v-if="storeAdb.deviceConnectState === 'authenticationError'"
        variant="soft"
        color="error"
        title="Device denied authorization request"
        description="Reload page and try again. Sometimes reconnecting USB cable can also help."
      />

      <UAlert
        v-if="storeAdb.deviceConnectState === 'error'"
        variant="soft"
        color="error"
        title="Something went wrong"
        description="Reload page and try again. Sometimes reconnecting USB cable can also help."
      />

      <UAlert
        v-if="storeAdb.deviceConnectState === 'authenticationWait'"
        variant="soft"
        color="warning"
        title="Check your device for authorization request"
      />

      <UAlert
        v-else-if="storeAdb.deviceIsConnecting"
        variant="soft"
        color="info"
        title="Connecting..."
      />
    </div>

    <UCard
      v-else-if="deviceList.length"
      class="flex w-full flex-col gap-2"
      variant="subtle"
    >
      <h2 class="mb-4 text-2xl">Paired devices</h2>

      <table class="w-full">
        <tbody>
          <tr
            v-for="usbDevice in deviceList"
            :key="usbDevice.name"
            class="hover:bg-neutral-600/25"
          >
            <td
              class="px-4 py-2"
              @click="
                () => {
                  console.log(usbDevice.name, usbDevice.device.raw)
                }
              "
            >
              {{ usbDevice.name }}
            </td>

            <td class="px-2 py-2 text-right">
              <UButton
                variant="ghost"
                color="primary"
                size="xs"
                @click="deviceSelect(usbDevice)"
                >Select</UButton
              >
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 px-4">
        <UButton
          variant="solid"
          color="primary"
          @click="deviceSelect()"
          >Add device</UButton
        >
      </div>
    </UCard>

    <div
      v-else
      class="flex justify-center"
    >
      <UButton
        class="px-10 py-6 text-2xl"
        variant="subtle"
        size="xl"
        @click="deviceSelect()"
        >Select device</UButton
      >
    </div>
  </div>
</template>
