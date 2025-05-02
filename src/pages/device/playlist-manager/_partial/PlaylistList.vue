<script setup lang="ts">
import { UButton } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import AppHeader from '~/components/AppHeader.vue'
import { useConfirm } from '~/components/confirmHelper'
import { getTableSelectColumn } from '~/components/table/selectHelper'
import { getHeaderSort } from '~/components/table/sortHelper'
import { useAsyncAction } from '~/lib/asyncAction'
import { tcf } from '~/lib/tailwind'
import { dateFromUnixTimestamp } from '~/service/date.service'
import { usePlaylistManagerStore } from '~/store/playlistManager'
import type { PlaylistWithInfo } from './interface'
import PlaylistEdit from './PlaylistEdit.vue'

const overlay = useOverlay()
const { confirm } = useConfirm()
const storePlaylistManager = usePlaylistManagerStore()
const playlistDirFilesWithInfo = useAsyncAction(() => storePlaylistManager.playlistsGetAll())

const playlistEditModal = overlay.create(PlaylistEdit)
const playlistEditOpen = async (playlist?: PlaylistWithInfo) => {
  const modal = playlistEditModal.open({ playlist })
  const result = (await modal.result) as boolean

  if (result) {
    await playlistDirFilesWithInfo.execute()
  }
}

const table = useTemplateRef<{ tableApi: Table<PlaylistWithInfo> }>('table')

const columns: TableColumn<PlaylistWithInfo>[] = [
  getTableSelectColumn(),
  {
    accessorKey: 'playlistTitle',
    enableSorting: true,
    header: getHeaderSort('Name'),
  },
  {
    id: 'songAuthor',
    accessorFn: (row) => row.info.playlistAuthor,
    enableSorting: true,
    header: getHeaderSort('Author'),
  },
  {
    id: 'songCount',
    accessorFn: (row) => row.info.songs.length,
    enableSorting: true,
    header: getHeaderSort('Songs'),
  },
  {
    id: 'created',
    accessorFn: (row) => row.dirEntry.ctime,
    enableSorting: true,
    header: getHeaderSort('Created'),
    cell: ({ row }) => {
      const date = dateFromUnixTimestamp(row.original.dirEntry.ctime)
      return date ? date.toLocaleString() : '---'
    },
  },
  {
    id: 'updated',
    accessorFn: (row) => row.dirEntry.mtime,
    enableSorting: true,
    header: getHeaderSort('Updated'),
    cell: ({ row }) => {
      const date = dateFromUnixTimestamp(row.original.dirEntry.mtime)
      return date ? date.toLocaleString() : '---'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h('div', { class: tcf('text-right') }, [
        h(UButton, {
          variant: 'soft',
          color: 'neutral',
          icon: 'i-lucide:pencil-line',
          onClick: () => playlistEditOpen(row.original),
        }),
      ])
    },
  },
]

const playlistRemoveAction = useAsyncAction(async () => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return

  const isConfirmed = await confirm({ title: 'Do you want to remove selected playlists?' })
  if (!isConfirmed) return

  const playlistRows = tableApi.getSelectedRowModel().rows
  if (!playlistRows) return

  const playlistFiles = playlistRows.map((row) => row.original.dirEntry.name)
  await storePlaylistManager.playlistsRemove(playlistFiles)

  await playlistDirFilesWithInfo.execute()
  tableApi.resetRowSelection()
})

const inputFilter = computed(() => {
  const filterValue = table.value?.tableApi?.getColumn('playlistTitle')?.getFilterValue()
  return typeof filterValue === 'string' ? filterValue : ''
})

const inputFilterUpdate = (val: string) => {
  table.value?.tableApi?.getColumn('playlistTitle')?.setFilterValue(val)
}

onBeforeMount(() => {
  playlistDirFilesWithInfo.execute()
})
</script>

<template>
  <div class="flex max-h-full flex-col gap-2">
    <AppHeader>
      <template #default>
        Playlists
        <span
          v-if="playlistDirFilesWithInfo.data.value"
          class="text-base"
          >({{ playlistDirFilesWithInfo.data.value.length }})</span
        >
      </template>

      <template #leftAppend>
        <UButton
          class="text-base"
          icon="i-lucide:refresh-ccw"
          variant="ghost"
          @click="playlistDirFilesWithInfo.execute()"
        />
      </template>

      <template #right>
        <UButton
          class=""
          icon="i-lucide:plus"
          variant="subtle"
          @click="playlistEditOpen()"
          >New playlist</UButton
        >
      </template>
    </AppHeader>

    <div class="flex items-center gap-4">
      <UInput
        class="max-w-sm min-w-[25ch]"
        placeholder="Filter playlists..."
        :modelValue="inputFilter"
        @update:modelValue="inputFilterUpdate"
      >
        <template
          v-if="inputFilter"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide:x"
            aria-label="Clear input"
            @click="inputFilterUpdate('')"
          />
        </template>
      </UInput>

      <div>
        <UButton
          variant="subtle"
          color="error"
          icon="i-lucide:x"
          :loading="playlistRemoveAction.status.value === 'pending'"
          @click="playlistRemoveAction.execute()"
          >Remove selected</UButton
        >
      </div>
    </div>

    <UTable
      ref="table"
      :getRowId="(row: PlaylistWithInfo) => row.dirEntry.name"
      :data="playlistDirFilesWithInfo.data.value ?? undefined"
      :columns="columns"
      sticky
      :loading="playlistDirFilesWithInfo.status.value === 'pending'"
    />
  </div>
</template>
