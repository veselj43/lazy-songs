<script setup lang="ts">
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
</script>

<template>
  <div class="grid h-screen justify-center p-10">
    <div class="mt-[10vh] flex flex-col items-center gap-10">
      <h1 class="mb-2 text-4xl">Lazy songs</h1>

      <div v-if="!adbHandler">
        <UAlert
          variant="soft"
          color="error"
        >
          Sorry, but your browser seems to not support WebUSB API.
        </UAlert>
      </div>

      <div v-else-if="storeAdb.deviceIsConnecting">
        <!-- TODO add more states -->

        <UAlert
          v-if="storeAdb.deviceConnectState === 'authorizationWait'"
          variant="soft"
          color="warning"
          title="Check your device for authorization request"
        />

        <UAlert
          v-else
          variant="soft"
          color="info"
          title="Connecting..."
        />
      </div>

      <div
        v-else-if="deviceList.length"
        class="flex min-w-sm flex-col gap-2"
      >
        <h2 class="mb-2 text-2xl">Paired devices</h2>

        <table class="w-full">
          <tbody>
            <tr
              v-for="usbDevice in deviceList"
              :key="usbDevice.name"
              class="hover:bg-neutral-400/10"
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
                  class="cursor-pointer"
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

        <div class="mt-2 px-4">
          <UButton
            class="cursor-pointer"
            variant="solid"
            color="primary"
            @click="deviceSelect()"
            >Add device</UButton
          >
        </div>
      </div>

      <div v-else>
        <UButton
          class="px-10 py-6 text-2xl"
          variant="subtle"
          size="xl"
          @click="deviceSelect()"
          >Select device</UButton
        >
      </div>

      <div>
        <UAlert
          v-if="storeAdb.deviceConnectState === 'authorizationError'"
          variant="soft"
          color="error"
          title="Device denied authorization request"
        />

        <UAlert
          v-if="storeAdb.deviceConnectState === 'error'"
          variant="soft"
          color="error"
          title="Something went wrong"
        />
      </div>
    </div>
  </div>
</template>
