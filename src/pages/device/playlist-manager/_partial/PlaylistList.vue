<script setup lang="ts">
import { UButton, UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import AppHeader from '~/components/AppHeader.vue'
import AppModalConfirm from '~/components/AppModalConfirm.vue'
import { getHeaderSort } from '~/components/table/sortHelper'
import { useAsyncAction } from '~/lib/asyncAction'
import { dateFromUnixTimestamp } from '~/service/date.service'
import { usePlaylistManagerStore } from '~/store/playlistManager'
import type { PlaylistWithInfo } from './interface'

const storePlaylistManager = usePlaylistManagerStore()

const table = useTemplateRef<{ tableApi: Table<PlaylistWithInfo> }>('table')
const modalConfirm = useTemplateRef('modalConfirm')

const playlistDirFilesWithInfo = useAsyncAction(() => storePlaylistManager.playlistsGetAll())

const columns: TableColumn<PlaylistWithInfo>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
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
  },
  {
    accessorKey: 'playlistTitle',
    enableSorting: true,
    header: getHeaderSort('Song title'),
  },
  {
    id: 'songAuthor',
    accessorFn: (row) => row.info.playlistAuthor,
    enableSorting: true,
    header: getHeaderSort('Playlist author'),
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
      return date ? date.toLocaleDateString() : '---'
    },
  },
  {
    id: 'updated',
    accessorFn: (row) => row.dirEntry.mtime,
    enableSorting: true,
    header: getHeaderSort('Updated'),
    cell: ({ row }) => {
      const date = dateFromUnixTimestamp(row.original.dirEntry.mtime)
      return date ? date.toLocaleDateString() : '---'
    },
  },
]

const playlistRemoveAction = useAsyncAction(async () => {
  const confirmApi = modalConfirm.value
  const tableApi = table.value?.tableApi

  if (!confirmApi || !tableApi) return

  const isConfirmed = await confirmApi.open()
  if (!isConfirmed) return

  const playlistRows = tableApi.getSelectedRowModel().rows
  if (!playlistRows) return

  const playlistFiles = playlistRows.map((row) => row.original.dirEntry)
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

      <template #right>
        <UButton
          class="text-base"
          icon="i-lucide:refresh-ccw"
          variant="ghost"
          @click="playlistDirFilesWithInfo.execute()"
        />
      </template>
    </AppHeader>

    <div class="flex items-center justify-between gap-2">
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
            icon="i-lucide-x"
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
      :data="playlistDirFilesWithInfo.data.value ?? undefined"
      :columns="columns"
      sticky
      :loading="playlistDirFilesWithInfo.status.value === 'pending'"
    />

    <AppModalConfirm
      ref="modalConfirm"
      title="Do you want to remove selected playlists?"
    />
  </div>
</template>
