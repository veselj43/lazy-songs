<script setup lang="ts">
import { UButton, UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import AppHeader from '~/components/AppHeader.vue'
import AppModalConfirm from '~/components/AppModalConfirm.vue'
import { getHeaderSort } from '~/components/table/sortHelper'
import { useAsyncAction } from '~/lib/asyncAction'
import { dateFromUnixTimestamp } from '~/service/date.service'
import { useSongManagerStore } from '~/store/songManager'
import type { SongWithInfo } from './interface'

const storeSongManager = useSongManagerStore()

const table = useTemplateRef<{ tableApi: Table<SongWithInfo> }>('table')
const modalConfirm = useTemplateRef('modalConfirm')

const songsDirFilesWithInfo = useAsyncAction((options: { force?: boolean }) => storeSongManager.songsGetAll(options))

const columns: TableColumn<SongWithInfo>[] = [
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
      return date ? date.toLocaleDateString() : '---'
    },
  },
]

const inputFilter = computed(() => {
  const filterValue = table.value?.tableApi?.getColumn('songTitle')?.getFilterValue()
  return typeof filterValue === 'string' ? filterValue : ''
})

const inputFilterUpdate = (val: string) => {
  table.value?.tableApi?.getColumn('songTitle')?.setFilterValue(val)
}

const songRemoveAction = useAsyncAction(async () => {
  const confirmApi = modalConfirm.value
  const tableApi = table.value?.tableApi

  if (!confirmApi || !tableApi) return

  const isConfirmed = await confirmApi.open()
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

      <template #right>
        <UButton
          class="text-base"
          icon="i-lucide:refresh-ccw"
          variant="ghost"
          @click="songsDirFilesWithInfo.execute({ force: true })"
        />
      </template>
    </AppHeader>

    <div class="flex items-center justify-between gap-2">
      <UInput
        class="max-w-sm min-w-[25ch]"
        placeholder="Filter songs..."
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
          :loading="songRemoveAction.status.value === 'pending'"
          @click="songRemoveAction.execute()"
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
    />

    <AppModalConfirm
      ref="modalConfirm"
      title="Do you want to remove selected songs?"
    />
  </div>
</template>
