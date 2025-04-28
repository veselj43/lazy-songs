import { tryCatch } from '~/lib/error'
import { AdbHandler, AdbSingleton, type AdbDeviceUiItem } from '~/lib/webUsbAdb'
import { useConfigStore } from './config'

export const useAdbStore = defineStore('adb', () => {
  const storeConfig = useConfigStore()

  const handler = shallowRef(AdbHandler.init())
  const device = shallowRef<AdbDeviceUiItem>()
  const deviceAdb = shallowRef<AdbSingleton>()
  const deviceConnectState = ref<
    'initial' | 'pending' | 'authenticationWait' | 'authenticationError' | 'authenticationSuccess' | 'error' | 'open'
  >('initial')
  const deviceIsConnecting = computed(() => {
    return ['pending', 'authenticationWait', 'authenticationSuccess'].includes(deviceConnectState.value)
  })

  const deviceConnect = async () => {
    const adbHandler = handler.value

    if (!adbHandler) {
      return
    }

    const deviceUi = device.value
    if (!deviceUi) {
      deviceConnectState.value = 'initial'
      return
    }

    deviceConnectState.value = 'pending'

    if (!deviceAdb.value) {
      const { data: adb, error } = await tryCatch(
        adbHandler.deviceConnect(deviceUi.device, {
          onAuthenticateStart: () => {
            deviceConnectState.value = 'authenticationWait'
          },
          onAuthenticateEnd(error) {
            deviceConnectState.value = error ? 'authenticationError' : 'authenticationSuccess'
          },
        }),
      )

      if (error) {
        deviceConnectState.value = 'error'
        return
      }

      deviceAdb.value = await AdbSingleton.from(adb)
      deviceConnectState.value = 'open'
    }
  }

  const deviceSelect = async (val?: AdbDeviceUiItem) => {
    const adb = deviceAdb.value?.adb
    if (adb && adb.serial !== val?.serial && deviceConnectState.value !== 'initial') {
      await adb.close()
      deviceAdb.value = undefined
    }

    deviceConnectState.value = 'initial'
    device.value = val

    if (val) {
      storeConfig.resetForDevice(val.device)
      await deviceConnect()
    }
  }

  const deviceAdbGetOrThrow = () => {
    if (!deviceAdb.value) {
      throw new Error('ADB not found')
    }
    return deviceAdb.value
  }

  return {
    device,
    deviceAdb,
    deviceAdbGetOrThrow,
    deviceConnectState,
    deviceIsConnecting,
    deviceSelect,
    handler,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAdbStore, import.meta.hot))
}
