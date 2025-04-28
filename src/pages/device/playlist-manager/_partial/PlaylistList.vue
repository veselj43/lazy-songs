<script setup lang="ts">
import { UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import AppHeader from '~/components/AppHeader.vue'
import AppModalConfirm from '~/components/AppModalConfirm.vue'
import { useAsyncAction } from '~/lib/asyncAction'
import { usePlaylistManagerStore } from '~/store/playlistManager'
import type { PlaylistWithInfo } from './interface'

const storePlaylistManager = usePlaylistManagerStore()

const table = useTemplateRef<{ tableApi: Table<PlaylistWithInfo> }>('table')
const modalConfirm = useTemplateRef('modalConfirm')

const playlistDirFilesWithInfo = useAsyncAction(() => storePlaylistManager.playlistsGetAll())

const columns: TableColumn<PlaylistWithInfo>[] = [
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
    accessorKey: 'playlistTitle',
    header: 'Song title',
  },
  {
    accessorKey: 'songAuthor',
    header: 'Playlist author',
    cell: ({ row }) => {
      const playlistInfo = row.original.info
      return playlistInfo.playlistAuthor
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
