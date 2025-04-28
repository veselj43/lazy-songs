import { streamFromString, streamPipeUnzip } from '~/lib/stream'
import type { DownloadSongStatus } from '~/pages/device/download-songs/_partial/interface'
import {
  BEAT_SABER_PLAYLIST_EXT,
  beatSaberPlaylistFromBeatSaverPlaylist,
  sanitizeFileName,
} from '~/service/beatSaber.service'
import type { BeatSaverPlaylist, BeatSaverPlaylistSong } from '~/service/beatSaver.interface'
import { beatSaverGetSongStream } from '~/service/beatSaver.service'
import { loggerPush } from '~/service/logger.service'
import { pathJoin } from '~/service/path.service'
import { useAdbStore } from './adb'
import { useConfigStore } from './config'

interface SongWithStatus {
  info: BeatSaverPlaylistSong
  status: DownloadSongStatus
}

export const usePlaylistStore = defineStore('playlist', () => {
  const storeAdb = useAdbStore()
  const storeConfig = useConfigStore()

  const currentData = ref<BeatSaverPlaylist>()
  const currentSongs = ref<SongWithStatus[]>()

  const currentDataSet = async (value?: BeatSaverPlaylist) => {
    if (!value) {
      currentData.value = undefined
      currentSongs.value = undefined
      return
    }

    currentData.value = value
    currentSongs.value = value.songs.map((song) => ({ info: song, status: 'initial' }))

    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    for (const song of currentSongs.value) {
      const path = pathJoin(storeConfig.pathSongs, song.info.hash)
      const exists = await syncUse.pathExists(path)

      song.status = exists ? 'done' : 'toDownload'
    }
  }

  const downloadSong = async (song: BeatSaverPlaylistSong, updateState: (state: DownloadSongStatus) => void) => {
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const sync = syncUse.sync
    const zipDirPath = pathJoin(storeConfig.pathSongs, song.hash)
    const dirExists = await syncUse.pathExists(zipDirPath)

    if (dirExists) {
      updateState('done')
      loggerPush('Already exists', song.songName)
      return
    }

    updateState('download')
    loggerPush('downloading', song.songName)

    const songResponse = await beatSaverGetSongStream(song.hash)
    if (!songResponse) {
      updateState('error')
      loggerPush('song not found', song.songName)
      return
    }

    updateState('unzip')
    loggerPush('unzipping', song.songName)

    const entries = streamPipeUnzip(songResponse.blob.stream())

    updateState('copy')
    loggerPush('copying song files', song.songName)

    for await (const entry of entries) {
      if (entry.directory) {
        continue
      }

      const filePath = pathJoin(zipDirPath, entry.filename)

      if (!entry.readable) {
        loggerPush('skipped - no file contents', entry.filename)
        continue
      }

      await sync.write({
        filename: filePath,
        file: entry.readable,
      })

      loggerPush('written', entry.filename)
    }

    updateState('done')
    loggerPush('done', song.songName)
  }

  const download = async () => {
    if (!currentSongs.value) return

    for (const song of currentSongs.value) {
      if (song.status === 'done') continue

      await downloadSong(song.info, (status) => {
        song.status = status
      })
    }
  }

  const create = async () => {
    if (!currentData.value) return

    const beatSaberPlaylist = beatSaberPlaylistFromBeatSaverPlaylist(currentData.value)
    const filePath = pathJoin(
      storeConfig.pathPlaylists,
      `${sanitizeFileName(beatSaberPlaylist.playlistTitle)}.${BEAT_SABER_PLAYLIST_EXT}`,
    )

    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const sync = syncUse.sync
    await sync.write({
      filename: filePath,
      file: streamFromString(JSON.stringify(beatSaberPlaylist, undefined, 2)),
    })
  }

  return {
    currentDataSet,
    currentData,
    currentSongs,
    download,
    create,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot))
}
