import { decodeUtf8, LinuxFileType } from '@yume-chan/adb'
import { streamFromString, streamReadToBytes } from '~/lib/stream'
import type { PlaylistWithInfo } from '~/pages/device/playlist-manager/_partial/interface'
import type { BeatSaberPlaylist } from '~/service/beatSaber.interface'
import { beatSaberPlaylistGetPathFromName } from '~/service/beatSaber.service'
import { pathJoin } from '~/service/path.service'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'

export const usePlaylistManagerStore = defineStore('playlistManager', () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()

  const playlistsGetAll = async () => {
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const sync = syncUse.sync
    const playlistsDirEntries = await sync.readdir(storeConfig.pathPlaylists)

    const playlistsWithInfo: PlaylistWithInfo[] = []

    for (const playlistEntry of playlistsDirEntries) {
      if (playlistEntry.type !== LinuxFileType.File) continue

      const playlistInfoPath = pathJoin(storeConfig.pathPlaylists, playlistEntry.name)

      const reader = sync.read(playlistInfoPath)
      const bytes = await streamReadToBytes(reader)
      const text = decodeUtf8(bytes)
      const info = JSON.parse(text) as BeatSaberPlaylist

      playlistsWithInfo.push({
        dirEntry: markRaw(playlistEntry),
        info: markRaw(info),
        playlistTitle: info.playlistTitle,
      })
    }

    return playlistsWithInfo
  }

  const playlistsRemove = async (playlistFiles: string[]) => {
    for (const playlistFile of playlistFiles) {
      const path = pathJoin(storeConfig.pathPlaylists, playlistFile)
      await storeAdb.deviceAdbGetOrThrow().adb.rm(path)
    }
  }

  const playlistExistsByTitle = async (playlistTitle: string) => {
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const path = pathJoin(storeConfig.pathPlaylists, beatSaberPlaylistGetPathFromName(playlistTitle))
    return await syncUse.pathExists(path)
  }

  const playlistSave = async (beatSaberPlaylist: BeatSaberPlaylist) => {
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const filePath = pathJoin(
      storeConfig.pathPlaylists,
      beatSaberPlaylistGetPathFromName(beatSaberPlaylist.playlistTitle),
    )

    await syncUse.sync.write({
      filename: filePath,
      file: streamFromString(JSON.stringify(beatSaberPlaylist, undefined, 2)),
    })

    await playlistsGetAll()
  }

  return {
    playlistsGetAll,
    playlistsRemove,
    playlistExistsByTitle,
    playlistSave,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistManagerStore, import.meta.hot))
}
