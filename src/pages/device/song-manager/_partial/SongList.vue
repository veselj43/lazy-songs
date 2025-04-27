<script setup lang="ts">
import { UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import { decodeUtf8, LinuxFileType, type AdbSyncEntry } from '@yume-chan/adb'
import AppHeader from '~/components/AppHeader.vue'
import AppModalConfirm from '~/components/AppModalConfirm.vue'
import { streamReadToBytes } from '~/lib/stream'
import { injectAdbCurrent } from '~/service/adb.provider'
import type { BeatSaberSongInfo } from '~/service/beatSaber.interface'
import { pathJoin } from '~/service/path.service'
import { useConfigStore } from '~/store/config'
import { useSongManagerStore } from '~/store/songManager'

const storeSongManager = useSongManagerStore()
const storeConfig = useConfigStore()

const adb = injectAdbCurrent()
const sync = await adb.value.sync()

const table = useTemplateRef('table')

const songsDirEntries = useAsyncData('songDirEntries', () => sync.readdir(storeConfig.pathSongs))

interface SongWithInfo {
  dirEntry: AdbSyncEntry
  info: BeatSaberSongInfo
  songTitle: string
}

const songsDirFilesWithInfo = useAsyncData(
  'songsDirFilesWithInfo',
  async () => {
    if (!songsDirEntries.data.value) {
      return []
    }

    const songsWithInfo: SongWithInfo[] = []

    for (const songEntry of songsDirEntries.data.value) {
      if (songEntry.type !== LinuxFileType.Directory) continue

      const songInfoPath = pathJoin(storeConfig.pathSongs, songEntry.name, 'Info.dat')

      const reader = sync.read(songInfoPath)
      const bytes = await streamReadToBytes(reader)
      const text = decodeUtf8(bytes)
      const info = JSON.parse(text) as BeatSaberSongInfo

      songsWithInfo.push({
        dirEntry: markRaw(songEntry),
        info,
        songTitle: `${info._songAuthorName} - ${info._songName}`,
      })
    }

    return songsWithInfo
  },
  {
    watch: [songsDirEntries.data],
  },
)

const columns: TableColumn<SongWithInfo>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'songTitle',
    header: 'Song title',
  },
  {
    accessorKey: 'songAuthor',
    header: 'Map author',
    cell: ({ row }) => {
      const songInfo = row.original.info
      return songInfo._levelAuthorName
    },
  },
]

const songRemoveAction = useAsyncData(
  'songsRemove',
  async () => {
    const songDirs = table.value?.tableApi.getSelectedRowModel()?.rows
    if (!songDirs) return

    for (const songDir of songDirs) {
      await storeSongManager.songRemove((songDir.original as SongWithInfo).dirEntry)
    }
  },
  {
    immediate: false,
  },
)

const modalConfirm = useTemplateRef('modalConfirm')

const songRemoveSelected = async () => {
  if (!modalConfirm.value) return

  const isConfirmed = await modalConfirm.value.open()
  if (!isConfirmed) return

  await songRemoveAction.execute()
  await songsDirEntries.refresh()
  table.value?.tableApi.resetRowSelection()
}
</script>

<template>
  <div class="flex max-h-full flex-col gap-2">
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

    <div class="flex items-center justify-between gap-2">
      <UInput
        class="max-w-sm min-w-[25ch]"
        placeholder="Filter songs..."
        :modelValue="table?.tableApi?.getColumn('songTitle')?.getFilterValue() as string"
        @update:modelValue="table?.tableApi?.getColumn('songTitle')?.setFilterValue($event)"
      />

      <div>
        <UButton
          variant="subtle"
          color="error"
          icon="i-lucide:x"
          :loading="songRemoveAction.status.value === 'pending'"
          @click="songRemoveSelected()"
          >Remove selected</UButton
        >
      </div>
    </div>

    <UTable
      ref="table"
      :data="songsDirFilesWithInfo.data.value ?? undefined"
      :columns="columns"
      sticky
      :loading="songsDirFilesWithInfo.status.value === 'pending'"
    >
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>

    <AppModalConfirm
      ref="modalConfirm"
      title="Do you want to remove selected songs?"
    />
  </div>
</template>
