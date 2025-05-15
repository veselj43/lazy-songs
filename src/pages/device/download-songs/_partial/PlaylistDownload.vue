<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { useConfirm } from '~/components/confirmHelper'
import { useAsyncAction } from '~/lib/asyncAction'
import { tryCatchSync } from '~/lib/error'
import { tvCn } from '~/lib/tailwind'
import { schemaBeatSavePlaylist, type BeatSaverPlaylist } from '~/service/beatSaver.interface'
import { loggerPush } from '~/service/logger.service'
import { usePlaylistDownloadStore } from '~/store/playlistDownload'
import SongStatusIcon from './DownloadStatusIcon.vue'

const { confirm } = useConfirm()
const storePlaylist = usePlaylistDownloadStore()
const fileBplistRef = shallowRef<{ inputRef: HTMLInputElement }>()
const fileError = shallowRef(false)

const downloadAction = useAsyncAction(() => storePlaylist.download())
const createAction = useAsyncAction(async () => {
  const exists = await storePlaylist.exists()
  if (exists) {
    const overwrite = await confirm({ title: 'Overwrite?', description: 'Playlist already exists.' })
    if (!overwrite) return
  }

  await storePlaylist.create()
})

const playlistDataSet = async (value?: BeatSaverPlaylist) => {
  await storePlaylist.currentDataSet(value)
  downloadAction.clear()
  createAction.clear()
}

// reset state on load
playlistDataSet()

const fileLoadAction = useAsyncAction(async () => {
  const file = fileBplistRef.value?.inputRef?.files?.[0]
  fileError.value = false

  if (!file) {
    playlistDataSet(undefined)
    return
  }

  if (file.type !== '' && !file.type.includes('bplist') && !file.type.includes('json')) {
    playlistDataSet(undefined)
    fileError.value = true
    return
  }

  const text = await file.text()
  const { data: dataParsed, error: errParse } = tryCatchSync(() => JSON.parse(text))

  if (errParse) {
    playlistDataSet(undefined)
    fileError.value = true
    loggerPush('Pase error', errParse.name, errParse.message)
    return
  }

  const { data: dataValidated, error: errValidation } = tryCatchSync(() => schemaBeatSavePlaylist.parse(dataParsed))

  if (errValidation) {
    playlistDataSet(undefined)
    console.warn('Validation error', errValidation, dataParsed)
    loggerPush('Validation error', errValidation.name, errValidation.message)
    return
  }

  playlistDataSet(dataValidated)
})
</script>

<template>
  <div>
    <AppHeader>Download songs from playlist</AppHeader>

    <p class="mb-4">
      Download any playlist from
      <a
        class="text-success-500 hover:underline"
        href="https://beatsaver.com/"
        target="_blank"
        >BeatSaver</a
      >
      (<code class="text-sm">.bplist</code> file), select the file below and download all songs to you Quest.
    </p>

    <div class="flex flex-col gap-2">
      <div>
        <UInput
          ref="fileBplistRef"
          class="w-full"
          :ui="{
            base: tvCn('cursor-pointer', fileError && 'ring-error'),
          }"
          type="file"
          accept=".bplist"
          :disabled="downloadAction.status.value === 'pending' || createAction.status.value === 'pending'"
          loadingAuto
          @change="fileLoadAction.execute()"
        />

        <div
          v-if="fileError"
          class="text-error p-1 text-sm"
        >
          Unable to load file content.
        </div>
      </div>

      <div
        v-if="storePlaylist.currentData"
        class="mb-5"
      >
        <div class="my-2 flex items-center justify-between gap-2">
          <div>
            {{ storePlaylist.currentData.playlistTitle }}
            <span class="text-neutral-400">by</span>
            {{ storePlaylist.currentData.playlistAuthor }}
          </div>

          <div class="flex gap-2">
            <UButton
              :disabled="fileLoadAction.status.value === 'pending' || createAction.status.value === 'pending'"
              :loading="downloadAction.status.value === 'pending'"
              :trailingIcon="downloadAction.status.value === 'success' ? 'i-lucide:check' : undefined"
              @click="downloadAction.execute()"
              >Download songs</UButton
            >

            <UButton
              :disabled="fileLoadAction.status.value === 'pending' || downloadAction.status.value === 'pending'"
              :loading="createAction.status.value === 'pending'"
              :trailingIcon="createAction.status.value === 'success' ? 'i-lucide:check' : undefined"
              @click="createAction.execute()"
              >Create in-game playlist</UButton
            >
          </div>
        </div>

        <div>
          <table class="ml-2">
            <tbody>
              <tr
                v-for="song in storePlaylist.currentSongs"
                :key="song.info.hash"
              >
                <td class="px-2 py-0.5">
                  <div class="grid place-items-center">
                    <SongStatusIcon :status="song.status" />
                  </div>
                </td>

                <td class="px-2 py-0.5">
                  {{ song.info.songName }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
