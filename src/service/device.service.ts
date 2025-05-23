import type { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb'

export interface DevicePaths {
  pathPlaylists: string
  pathSongDataCache: string
  pathSongs: string
}

export const devicePathsResolve = (device: AdbDaemonWebUsbDevice): DevicePaths => {
  const { productId, vendorId } = device.raw

  if (vendorId === 10291 && productId === 390) {
    // Quest 2
    return {
      pathPlaylists: '/sdcard/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
      pathSongDataCache: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongCore/CachedSongData.json',
      pathSongs: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
    }
  }

  if (vendorId === 10291) {
    // other Quests ? - TODO check
    return {
      pathPlaylists: '/sdcard/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
      pathSongDataCache: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongCore/CachedSongData.json',
      pathSongs: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
    }
  }

  if (vendorId === 10007 && (productId === 65288 || productId === 65352)) {
    // Android device used for testing
    return {
      pathPlaylists: '/sdcard/_test/playlists',
      pathSongDataCache: '/sdcard/_test/CachedSongData.json',
      pathSongs: '/sdcard/_test/songs',
    }
  }

  // yolo - TODO handling
  return {
    pathPlaylists: '/sdcard/ModData/com.beatgames.beatsaber/Mods/PlaylistManager/Playlists',
    pathSongDataCache: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongCore/CachedSongData.json',
    pathSongs: '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomLevels',
  }
}
