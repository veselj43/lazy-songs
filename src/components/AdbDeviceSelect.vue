<script setup lang="ts">
import type { AdbDeviceUiItem } from '~/lib/webUsbAdb'
import { injectAdbHandler } from '~/service/adb.provider'
import { useAdbStore } from '~/store/adb'
import AppHeader from './AppHeader.vue'

const adbHandler = injectAdbHandler()
const storeAdb = useAdbStore()

const devicesData = await useAsyncData<AdbDeviceUiItem[]>(() => adbHandler.deviceGetList())

const deviceList = computed(() => {
  return devicesData.status.value === 'success' && devicesData.data.value ? devicesData.data.value : []
})

const deviceSelect = (deviceNew: AdbDeviceUiItem | undefined) => {
  storeAdb.deviceSelect(deviceNew)
}

const deviceAdd = async () => {
  const deviceToAdd = await adbHandler.deviceRequest()
  deviceSelect(deviceToAdd)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <AppHeader>
      <template #default>Devices</template>
      <template #right>
        <UButton
          icon="i-material-symbols:add-rounded"
          size="lg"
          @click="deviceAdd"
          >Add USB device</UButton
        >
      </template>
    </AppHeader>

    <div class="mx-2 my-5">
      <UAlert
        v-if="storeAdb.deviceConnectState === 'authorizationWait'"
        variant="soft"
        color="warning"
        title="Check your device for authorization request"
      />

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

      <table v-if="deviceList.length">
        <tbody>
          <tr
            v-for="usbDevice in deviceList"
            :key="usbDevice.name"
            class="flex items-center gap-4"
          >
            <td
              @click="
                () => {
                  console.log(usbDevice.name, usbDevice.device.raw)
                }
              "
            >
              {{ usbDevice.name }}
            </td>

            <td>
              <template v-if="usbDevice.name !== storeAdb.device?.name">
                <UButton
                  class="cursor-pointer"
                  color="primary"
                  variant="outline"
                  size="xs"
                  @click="deviceSelect(usbDevice)"
                  >Select</UButton
                >
              </template>

              <template v-else>
                <UButton
                  v-if="storeAdb.deviceIsConnecting"
                  color="warning"
                  size="xs"
                  loading
                >
                  Connecting
                </UButton>

                <UButton
                  v-else-if="storeAdb.deviceConnectState === 'open'"
                  class="pointer-events-none"
                  color="success"
                  size="xs"
                >
                  Connected
                </UButton>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <UAlert
        v-else
        class="text-center"
        variant="soft"
        color="info"
        title="No added devices"
      />
    </div>
  </div>
</template>
