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
import type { SongWithInfo } from '~/service/uiBeatSaber.interface'
import { useSongManagerStore } from '~/store/songManager'

const { confirm } = useConfirm()
const storeSongManager = useSongManagerStore()

const table = useTemplateRef<{ tableApi: Table<SongWithInfo> }>('table')

const songsDirFilesWithInfo = useAsyncAction((options: { force?: boolean }) => storeSongManager.songsGetAll(options))

const columns: TableColumn<SongWithInfo>[] = [
  getTableSelectColumn(),
  {
    accessorKey: 'songTitle',
    enableSorting: true,
    header: getHeaderSort('Song title'),
  },
  {
    id: 'songAuthor',
    accessorFn: (row) => row.info._levelAuthorName,
    enableSorting: true,
    header: getHeaderSort('Map author'),
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
    meta: {
      class: {
        td: tcf('tabular-nums'),
      },
    },
  },
]

const tableFilterSongTitle = computed(() => {
  const filterValue = table.value?.tableApi?.getColumn('songTitle')?.getFilterValue()
  return typeof filterValue === 'string' ? filterValue : ''
})

const tableFilterSongTitleUpdate = (val: string) => {
  table.value?.tableApi?.getColumn('songTitle')?.setFilterValue(val)
}

const songRemoveAction = useAsyncAction(async () => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return

  const isConfirmed = await confirm({ title: 'Do you want to remove selected songs?' })
  if (!isConfirmed) return

  const tableRows = tableApi.getSelectedRowModel().rows
  if (!tableRows) return

  const songDirs = tableRows.map((row) => row.original.dirEntry)
  await storeSongManager.songsRemove(songDirs)

  await songsDirFilesWithInfo.execute({ force: false })
  tableApi.resetRowSelection()
})

onBeforeMount(() => {
  songsDirFilesWithInfo.execute({ force: false })
})
</script>

<template>
  <div class="flex max-h-full flex-col gap-2">
    <AppHeader>
      <template #default>
        Songs
        <span
          v-if="songsDirFilesWithInfo.data.value"
          class="text-base"
          >({{ songsDirFilesWithInfo.data.value.length }})</span
        >
      </template>

      <template #leftAppend>
        <UButton
          class="text-base"
          icon="i-lucide:refresh-ccw"
          variant="ghost"
          @click="songsDirFilesWithInfo.execute({ force: true })"
        />
      </template>
    </AppHeader>

    <div class="flex items-center justify-between gap-4">
      <UInput
        class="max-w-sm min-w-[25ch]"
        placeholder="Filter songs..."
        :modelValue="tableFilterSongTitle"
        @update:modelValue="tableFilterSongTitleUpdate"
      >
        <template
          v-if="tableFilterSongTitle"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide:x"
            aria-label="Clear input"
            @click="tableFilterSongTitleUpdate('')"
          />
        </template>
      </UInput>

      <div>
        <UButton
          variant="subtle"
          color="error"
          icon="i-lucide:x"
          :loading="songRemoveAction.status.value === 'pending'"
          @click="songRemoveAction.execute()"
          >Remove selected</UButton
        >
      </div>
    </div>

    <UTable
      ref="table"
      :getRowId="(row: SongWithInfo) => row.dirEntry.name"
      :data="songsDirFilesWithInfo.data.value ?? undefined"
      :columns="columns"
      sticky
      :loading="songsDirFilesWithInfo.status.value === 'pending'"
    />
  </div>
</template>
