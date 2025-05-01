import { decodeUtf8, LinuxFileType, type AdbSyncEntry } from '@yume-chan/adb'
import { streamReadToBytes } from '~/lib/stream'
import type { BeatSaberSongInfo } from '~/service/beatSaber.interface'
import { loggerPush } from '~/service/logger.service'
import { pathJoin } from '~/service/path.service'
import type { SongWithInfo } from '~/service/uiBeatSaber.interface'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'
import { useModSongLoaderStore } from './modSongLoader'

export const useSongManagerStore = defineStore('songManager', () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()
  const storeModSongLoader = useModSongLoaderStore()

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

      const songDirPath = pathJoin(storeConfig.pathSongs, songEntry.name)
      const songInfoPath = pathJoin(songDirPath, 'Info.dat')

      const songInfoExists = await syncUse.pathExists(songInfoPath)
      if (!songInfoExists) {
        loggerPush('Warn: Song Info.dat not found', songInfoPath)
        continue
      }

      const hashFromCache = await storeModSongLoader.getSongHashFromPath(songDirPath)
      /**
       * For songs that were not loaded by SongLoader use their dirname.
       * It is expected, that the dirname is actually the hash, as the song was most likely created by this tool.
       * In case it was created some other way, it won't be identified correctly for playlist references.
       */
      const hash = hashFromCache ?? songEntry.name

      const reader = sync.read(songInfoPath)
      const bytes = await streamReadToBytes(reader)
      const text = decodeUtf8(bytes)
      const info = JSON.parse(text) as BeatSaberSongInfo

      songsWithInfo.push({
        dirEntry: markRaw(songEntry),
        info,
        songTitle: `${info._songAuthorName} - ${info._songName}`,
        hash,
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
