<script setup lang="ts">
import { deviceGetMtpEndpoints, type DeviceWithMtp } from '~/lib/webUsb'

const usbDevicesData = await useAsyncData<USBDevice[]>(() => window.navigator.usb.getDevices())

const deviceWithMtp = ref<DeviceWithMtp>()

const deviceSelect = (deviceSelected: USBDevice) => {
  deviceWithMtp.value = deviceGetMtpEndpoints(deviceSelected)
}

const usbDeviceAdd = async () => {
  const deviceToAdd = await window.navigator.usb.requestDevice({ filters: [{}] })
  deviceSelect(deviceToAdd)
  await usbDevicesData.refresh()
}

const connectTest = async () => {
  if (!deviceWithMtp.value) {
    return
  }

  // TODO
}

watchEffect(() => {
  if (!deviceWithMtp.value && usbDevicesData.data.value?.length) {
    deviceSelect(usbDevicesData.data.value[0])
  }
})
</script>

<template>
  <div>
    <h1 class="mt-4 mb-2 text-3xl">USB test</h1>

    <UButton @click="usbDeviceAdd">Add USB device</UButton>

    <h2 class="mt-4 mb-2 text-2xl">Selected devices</h2>

    <div class="ml-2">
      <ul v-if="usbDevicesData.status.value === 'success'">
        <li
          v-for="usbDevice in usbDevicesData.data.value"
          :key="usbDevice.productId"
          class="flex items-center gap-4"
        >
          <div>{{ usbDevice.productName }} ({{ usbDevice.productId }})</div>

          <UButton
            v-if="usbDevice.productId !== deviceWithMtp?.device?.productId"
            color="neutral"
            size="xs"
            @click="deviceSelect(usbDevice)"
            >Select</UButton
          >
          <UButton
            v-else
            color="warning"
            size="xs"
            disabled
            >Selected</UButton
          >
        </li>
      </ul>
    </div>

    <div class="my-4">
      <UButton @click="connectTest">Connect test</UButton>
    </div>
  </div>
</template>
