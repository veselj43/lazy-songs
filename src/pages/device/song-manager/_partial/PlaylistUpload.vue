<script setup lang="ts">
import { streamPipeUnzip } from '~/lib/stream'
import { adbSyncPathExists } from '~/lib/webUsbAdb'
import { injectAdbCurrent } from '~/service/adb.provider'
import type { BeatSaberPlaylistSong } from '~/service/beatSaber.interface'
import { beatSaverGetSongStream } from '~/service/beatSaver.service'
import { pathJoin } from '~/service/path.service'
import { useConfigStore } from '~/store/config'

const adb = injectAdbCurrent()
const sync = await adb.value.sync()

const storeConfig = useConfigStore()

const fileBplistRef = ref<{ inputRef: HTMLInputElement }>()
const fileBplistContent = ref()

const fileLoad = async () => {
  const file = fileBplistRef.value?.inputRef?.files?.[0]

  if (!file) {
    fileBplistContent.value = undefined
    return
  }

  const text = await file.text()
  const data = JSON.parse(text)

  fileBplistContent.value = data
}

const downloadPlaylist = async () => {
  if (!fileBplistContent.value) return

  const songs = fileBplistContent.value.songs as BeatSaberPlaylistSong[]

  for (const song of songs) {
    await downloadPlaylistSong(song)
  }
}

const downloadPlaylistSong = async (song: BeatSaberPlaylistSong) => {
  const zipDirPath = pathJoin(storeConfig.pathSongs, song.hash)
  const dirExists = await adbSyncPathExists(sync, zipDirPath)

  if (dirExists) {
    console.log('Already exists', song.songName)
    return
  }

  const songResponse = await beatSaverGetSongStream(song.hash)
  if (!songResponse) {
    console.log('Song not found', song.songName)
    return
  }

  const entries = streamPipeUnzip(songResponse.blob.stream())

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

  console.log('done', song.songName)
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl">Upload playlist</h2>

    <div>
      <div class="flex flex-col gap-4">
        <UInput
          ref="fileBplistRef"
          class="w-full"
          :ui="{
            base: 'cursor-pointer',
          }"
          type="file"
          accept=".bplist"
          @change="fileLoad()"
        />

        <div>
          <UButton @click="downloadPlaylist()">Download songs</UButton>
        </div>
      </div>

      <pre class="m-2">{{ fileBplistContent }}</pre>
    </div>
  </div>
</template>
