import type { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb'
import { devicePathsResolve, type DevicePaths } from '~/service/device.service'

export const useConfigStore = defineStore('config', () => {
  const pathPlaylists = ref('/storage/self/primary/')
  const pathSongDataCache = ref('/storage/self/primary/')
  const pathSongs = ref('/storage/self/primary/')

  const pathsSet = (devicePaths: DevicePaths) => {
    pathPlaylists.value = devicePaths.pathPlaylists
    pathSongDataCache.value = devicePaths.pathSongDataCache
    pathSongs.value = devicePaths.pathSongs
  }

  const resetForDevice = (device: AdbDaemonWebUsbDevice) => {
    const devicePaths = devicePathsResolve(device)
    pathsSet(devicePaths)
  }

  return {
    pathPlaylists,
    pathSongDataCache,
    pathSongs,
    pathsSet,
    resetForDevice,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot))
}
