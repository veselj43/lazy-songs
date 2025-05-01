import { decodeUtf8, LinuxFileType } from '@yume-chan/adb'
import { streamReadToBytes } from '~/lib/stream'
import { loggerPush } from '~/service/logger.service'
import { pathJoin } from '~/service/path.service'
import type { SongLoaderCachedSongData } from '~/service/songLoader.interface'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'

export const useModSongLoaderStore = defineStore('modSongLoader', () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()

  const cachedSongData = shallowRef<SongLoaderCachedSongData>()

  const getCachedSongData = async () => {
    if (cachedSongData.value) {
      return cachedSongData.value
    }

    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()

    const cacheFileExists = await syncUse.pathStat(storeConfig.pathSongDataCache)
    if (!cacheFileExists || cacheFileExists.type !== LinuxFileType.File) {
      loggerPush('Warn: Not found songLoader cache: ', storeConfig.pathSongDataCache)
      console.warn('Warn: Not found songLoader cache: ', storeConfig.pathSongDataCache)
      cachedSongData.value = undefined
      return
    }

    const reader = syncUse.sync.read(storeConfig.pathSongDataCache)
    const bytes = await streamReadToBytes(reader)
    const text = decodeUtf8(bytes)
    cachedSongData.value = JSON.parse(text) as SongLoaderCachedSongData

    console.log(cachedSongData.value)

    return cachedSongData.value
  }

  const checkSongExistsInCache = async (songHash: string): Promise<boolean | undefined> => {
    const cachedSongData = await getCachedSongData()
    if (!cachedSongData) return

    const songSha1 = songHash.toUpperCase()
    const songCachedEntry = Object.entries(cachedSongData).find(([, data]) => data.sha1 === songSha1)

    return !!songCachedEntry
  }

  const checkSongExistsByHashDir = async (songHash: string) => {
    const path = pathJoin(storeConfig.pathSongs, songHash)
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const exists = await syncUse.pathExists(path)

    return exists
  }

  const checkSongExists = async (songHash: string) => {
    const existsInCache = await checkSongExistsInCache(songHash)
    if (existsInCache) return true

    const existsHashDir = await checkSongExistsByHashDir(songHash)
    if (existsHashDir) return true

    return false
  }

  return {
    checkSongExists,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModSongLoaderStore, import.meta.hot))
}
