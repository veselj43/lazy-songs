import type { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb'

export interface DevicePaths {
  pathPlaylists: string
  pathSongs: string
}

export const devicePathsResolve = (device: AdbDaemonWebUsbDevice): DevicePaths => {
  const { productId, vendorId } = device.raw

  if (vendorId === 10291 && productId === 390) {
    // Quest 2
    return {
      pathPlaylists: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
      pathSongs: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
    }
  }

  if (vendorId === 10291) {
    // other Quests ? - TODO check
    return {
      pathPlaylists: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
      pathSongs: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
    }
  }

  if (vendorId === 10007 && productId === 65288) {
    // Android device used for testing
    return {
      pathPlaylists: '/storage/self/primary/_test/playlists',
      pathSongs: '/storage/self/primary/_test/songs',
    }
  }

  // yolo - TODO handling
  return {
    pathPlaylists: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
    pathSongs: '/storage/self/primary/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
  }
}
