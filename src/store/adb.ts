import type { Adb } from '@yume-chan/adb'
import { tryCatch } from '~/lib/error'
import { AdbHandler, type AdbDeviceUiItem } from '~/lib/webUsbAdb'

export const useAdbStore = defineStore('adb', () => {
  const handler = shallowRef(AdbHandler.init())

  const device = shallowRef<AdbDeviceUiItem>()
  const deviceAdb = shallowRef<Adb>()

  const deviceConnectState = ref<
    'initial' | 'pending' | 'authorizationWait' | 'authorizationError' | 'authorizationSuccess' | 'error' | 'open'
  >('initial')

  const deviceIsConnecting = computed(() => {
    return ['pending', 'authorizationWait', 'authorizationSuccess'].includes(deviceConnectState.value)
  })

  const deviceConnect = async () => {
    const adbHandler = handler.value

    if (!adbHandler) {
      return
    }

    deviceConnectState.value = 'pending'

    const deviceUi = device.value
    if (!deviceUi) {
      deviceConnectState.value = 'initial'
      return
    }

    if (!deviceAdb.value) {
      const { data: adb, error } = await tryCatch(
        adbHandler.deviceConnect(deviceUi.device, {
          onAuthenticateStart: () => {
            deviceConnectState.value = 'authorizationWait'
          },
          onAuthenticateEnd(error) {
            deviceConnectState.value = error ? 'authorizationError' : 'authorizationSuccess'
          },
        }),
      )

      if (error) {
        deviceConnectState.value = 'error'
        return
      }

      deviceAdb.value = adb
      deviceConnectState.value = 'open'
    }
  }

  const deviceSelect = (val?: AdbDeviceUiItem) => {
    const adb = deviceAdb.value
    if (adb && adb.serial !== val?.serial) {
      adb.close()
    }

    device.value = val

    if (val) {
      deviceConnect()
    }
  }

  return {
    device,
    deviceAdb,
    deviceConnectState,
    deviceIsConnecting,
    deviceSelect,
    handler,
  }
})
