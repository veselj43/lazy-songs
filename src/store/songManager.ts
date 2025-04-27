import type { AdbSyncEntry } from '@yume-chan/adb'
import { pathJoin } from '~/service/path.service'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'

export const useSongManagerStore = () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()
  const adb = storeAdb.deviceAdb

  if (!adb) {
    throw new Error('ADB not found')
  }

  const songRemove = async (songDir: AdbSyncEntry) => {
    const path = pathJoin(storeConfig.pathSongs, songDir.name)
    await adb.adb.rm(path, { recursive: true })
  }

  return {
    songRemove,
  }
}
