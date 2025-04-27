import { streamFromString, streamPipeUnzip } from '~/lib/stream'
import type { DownloadSongStatus } from '~/pages/device/download-songs/_partial/interface'
import {
  BEAT_SABER_PLAYLIST_EXT,
  beatSaberPlaylistFromBeatSaverPlaylist,
  sanitizeFileName,
} from '~/service/beatSaber.service'
import type { BeatSaverPlaylist, BeatSaverPlaylistSong } from '~/service/beatSaver.interface'
import { beatSaverGetSongStream } from '~/service/beatSaver.service'
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
  const adb = storeAdb.deviceAdb

  if (!adb) {
    throw new Error('ADB not found')
  }

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

    for (const song of currentSongs.value) {
      const path = pathJoin(storeConfig.pathSongs, song.info.hash)
      const exists = await adb.pathExists(path)

      song.status = exists ? 'done' : 'toDownload'
    }
  }

  const downloadSong = async (song: BeatSaverPlaylistSong, updateState: (state: DownloadSongStatus) => void) => {
    const sync = await adb.sync()
    const zipDirPath = pathJoin(storeConfig.pathSongs, song.hash)
    const dirExists = await adb.pathExists(zipDirPath)

    if (dirExists) {
      updateState('done')
      console.log('Already exists', song.songName)
      return
    }

    updateState('download')

    const songResponse = await beatSaverGetSongStream(song.hash)
    if (!songResponse) {
      updateState('error')
      console.log('Song not found', song.songName)
      return
    }

    updateState('unzip')

    const entries = streamPipeUnzip(songResponse.blob.stream())

    updateState('copy')

    for await (const entry of entries) {
      if (entry.directory) {
        // console.log('skipped - dir', entry.filename)
        continue
      }

      const filePath = pathJoin(zipDirPath, entry.filename)

      if (!entry.readable) {
        console.log('skipped - no content', entry.filename)
        continue
      }

      await sync.write({
        filename: filePath,
        file: entry.readable,
      })

      // console.log('written', entry.filename)
    }

    updateState('done')

    console.log('done', song.songName)
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

    const sync = await adb.sync()
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
