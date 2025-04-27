import { decodeUtf8, LinuxFileType, type AdbSyncEntry } from '@yume-chan/adb'
import { streamReadToBytes } from '~/lib/stream'
import type { SongWithInfo } from '~/pages/device/song-manager/_partial/interface'
import type { BeatSaberSongInfo } from '~/service/beatSaber.interface'
import { loggerPush } from '~/service/logger.service'
import { pathJoin } from '~/service/path.service'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'

export const useSongManagerStore = defineStore('songManager', () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()

  const songs = shallowRef<SongWithInfo[]>()
  const songsUpdated = shallowRef<number>()

  const songsGetAll = async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && songs.value && songsUpdated.value && Date.now() - songsUpdated.value < 30 * 1_000) {
      return songs.value
    }

    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const sync = syncUse.sync
    const songsDirEntries = await sync.readdir(storeConfig.pathSongs)

    const songsWithInfo: SongWithInfo[] = []

    for (const songEntry of songsDirEntries) {
      if (songEntry.type !== LinuxFileType.Directory) continue

      const songInfoPath = pathJoin(storeConfig.pathSongs, songEntry.name, 'Info.dat')

      const songInfoExists = await syncUse.pathExists(songInfoPath)
      if (!songInfoExists) {
        loggerPush('Warn: Song Info.dat not found', songInfoPath)
        continue
      }

      const reader = sync.read(songInfoPath)
      const bytes = await streamReadToBytes(reader)
      const text = decodeUtf8(bytes)
      const info = JSON.parse(text) as BeatSaberSongInfo

      songsWithInfo.push({
        dirEntry: markRaw(songEntry),
        info,
        songTitle: `${info._songAuthorName} - ${info._songName}`,
      })
    }

    songs.value = songsWithInfo
    songsUpdated.value = Date.now()

    return songsWithInfo
  }

  const songsRemove = async (songDirs: AdbSyncEntry[]) => {
    for (const songDir of songDirs) {
      const path = pathJoin(storeConfig.pathSongs, songDir.name)
      await storeAdb.deviceAdbGetOrThrow().adb.rm(path, { recursive: true })
    }

    if (!songs.value) return

    songs.value = songs.value.filter((song) => songDirs.some((songDir) => songDir.name === song.dirEntry.name))
  }

  return {
    songs,
    songsGetAll,
    songsRemove,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSongManagerStore, import.meta.hot))
}
