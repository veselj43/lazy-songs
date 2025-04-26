<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { tryCatchSync } from '~/lib/error'
import { schemaBeatSavePlaylist, type BeatSaverPlaylist } from '~/service/beatSaver.interface'
import { usePlaylistStore } from '~/store/playlist'
import SongStatusIcon from './DownloadStatusIcon.vue'

const storePlaylist = usePlaylistStore()
const fileBplistRef = ref<{ inputRef: HTMLInputElement }>()

const downloadAction = useAsyncData('playlistDownload', () => storePlaylist.download(), {
  immediate: false,
})

const createAction = useAsyncData('playlistCreate', () => storePlaylist.create(), {
  immediate: false,
})

const playlistDataSet = (value?: BeatSaverPlaylist) => {
  storePlaylist.currentDataSet(value)
  downloadAction.clear()
  createAction.clear()
}

const fileLoad = async () => {
  const file = fileBplistRef.value?.inputRef?.files?.[0]

  if (!file) {
    playlistDataSet(undefined)
    return
  }

  const text = await file.text()
  const { data: dataParsed, error: errParse } = tryCatchSync(() => JSON.parse(text))

  if (errParse) {
    playlistDataSet(undefined)
    console.log('Pase error', errParse)
    return
  }

  const { data: dataValidated, error: errValidation } = tryCatchSync(() => schemaBeatSavePlaylist.parse(dataParsed))

  if (errValidation) {
    playlistDataSet(undefined)
    console.log('Validation error', errValidation, dataParsed)
    return
  }

  playlistDataSet(dataValidated)
}
</script>

<template>
  <div>
    <AppHeader>Download playlist</AppHeader>

    <div class="flex flex-col gap-2">
      <div>
        <UInput
          ref="fileBplistRef"
          class="w-full"
          :ui="{
            base: 'cursor-pointer',
          }"
          type="file"
          accept=".bplist"
          :disabled="downloadAction.status.value === 'pending' || createAction.status.value === 'pending'"
          @change="fileLoad()"
        />
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
              :disabled="createAction.status.value === 'pending'"
              :loading="downloadAction.status.value === 'pending'"
              :trailingIcon="downloadAction.status.value === 'success' ? 'i-solar:check-square-linear' : undefined"
              @click="downloadAction.execute()"
              >Download songs</UButton
            >

            <UButton
              :disabled="downloadAction.status.value === 'pending'"
              :loading="createAction.status.value === 'pending'"
              :trailingIcon="createAction.status.value === 'success' ? 'i-solar:check-square-linear' : undefined"
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

      <!-- <pre class="m-2">{{ fileBplistContent }}</pre> -->
    </div>
  </div>
</template>
