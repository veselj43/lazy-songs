<script setup lang="ts">
import { decodeUtf8, LinuxFileType } from '@yume-chan/adb'
import AppHeader from '~/components/AppHeader.vue'
import { streamReadToBytes } from '~/lib/stream'
import { injectAdbCurrent } from '~/service/adb.provider'
import type { BeatSaberSongInfo } from '~/service/beatSaber.interface'
import { pathJoin } from '~/service/path.service'
import { useConfigStore } from '~/store/config'

const adb = injectAdbCurrent()
const sync = await adb.value.sync()

const storeConfig = useConfigStore()

const songsDirEntries = useAsyncData('songDirEntries', () => sync.readdir(storeConfig.pathSongs))

const songsDirFilesWithInfo = useAsyncData(
  'songsDirFilesWithInfo',
  async () => {
    if (!songsDirEntries.data.value) {
      return []
    }

    const songsWithInfo = []

    for (const songEntry of songsDirEntries.data.value) {
      if (songEntry.type !== LinuxFileType.Directory) continue

      const songInfoPath = pathJoin(storeConfig.pathSongs, songEntry.name, 'Info.dat')

      const reader = sync.read(songInfoPath)
      const bytes = await streamReadToBytes(reader)
      const text = decodeUtf8(bytes)
      const info = JSON.parse(text) as BeatSaberSongInfo

      songsWithInfo.push({
        dirEntry: songEntry,
        info,
      })
    }

    return songsWithInfo
  },
  {
    watch: [songsDirEntries.data],
  },
)
</script>

<template>
  <div>
    <AppHeader>
      <template #left>
        <h2 class="mb-4 text-2xl">Songs</h2>
      </template>
      <template #right>
        <UButton
          icon="i-solar:refresh-linear"
          variant="ghost"
          @click="songsDirEntries.refresh()"
        />
      </template>
    </AppHeader>

    <div class="w-full">
      <table
        v-if="songsDirFilesWithInfo.status.value === 'success'"
        class="w-full"
      >
        <tbody>
          <tr
            v-for="song in songsDirFilesWithInfo.data.value"
            :key="song.dirEntry.name"
          >
            <td>{{ song.info._songAuthorName }} - {{ song.info._songName }}</td>
            <td>{{ song.info._levelAuthorName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
