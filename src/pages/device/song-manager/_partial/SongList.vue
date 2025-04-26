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
  <div class="flex max-h-full flex-col">
    <AppHeader>
      <template #default>Songs</template>
      <template #right>
        <UButton
          class="cursor-pointer text-base"
          icon="i-solar:refresh-linear"
          variant="ghost"
          @click="songsDirEntries.refresh()"
        />
      </template>
    </AppHeader>

    <div class="w-full overflow-y-auto">
      <table
        v-if="songsDirFilesWithInfo.status.value === 'success'"
        class="w-full"
      >
        <thead>
          <tr>
            <th class="px-1 py-1 text-left">Song name</th>
            <th class="px-1 py-1 text-left">Map author</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="song in songsDirFilesWithInfo.data.value"
            :key="song.dirEntry.name"
          >
            <td class="px-1 py-0.5">{{ song.info._songAuthorName }} - {{ song.info._songName }}</td>
            <td class="px-1 py-0.5">{{ song.info._levelAuthorName }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="songsDirFilesWithInfo.status.value === 'pending'">
        <div class="mt-6 flex w-full flex-col gap-2">
          <div
            v-for="(x, i) in Array(5).fill(0)"
            :key="i"
            class="flex items-center gap-4 px-2 py-1"
          >
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
