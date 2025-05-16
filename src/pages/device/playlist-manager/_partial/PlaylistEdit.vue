<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'
import { z } from 'zod'
import { useConfirm } from '~/components/confirmHelper'
import { getTableSelectColumn } from '~/components/table/selectHelper'
import { getHeaderSort } from '~/components/table/sortHelper'
import { useAsyncAction } from '~/lib/asyncAction'
import { tcf } from '~/lib/tailwind'
import {
  schemaBeatSaberPlaylist,
  type BeatSaberPlaylist,
  type BeatSaberPlaylistSong,
} from '~/service/beatSaber.interface'
import { beatSaberPlaylistImageFromFile } from '~/service/beatSaber.service'
import { dateFromUnixTimestamp } from '~/service/date.service'
import { fileGetBase64ImgUrl } from '~/service/fileManipulation.service'
import type { SongWithInfo } from '~/service/uiBeatSaber.interface'
import { usePlaylistManagerStore } from '~/store/playlistManager'
import { useSongManagerStore } from '~/store/songManager'
import type { PlaylistWithInfo } from './interface'

const props = defineProps<{
  playlist?: PlaylistWithInfo
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const { confirm } = useConfirm()
const storeSongManager = useSongManagerStore()
const storePlaylistManager = usePlaylistManagerStore()

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

const tableFilterSelected = computed(() => {
  const filterValue = table.value?.tableApi?.getColumn('selected')?.getFilterValue()
  return !!filterValue
})

const tableFilterSelectedUpdate = (val: boolean | 'indeterminate') => {
  table.value?.tableApi?.getColumn('selected')?.setFilterValue(val || undefined)
}

const tableFilterSongTitle = computed(() => {
  const filterValue = table.value?.tableApi?.getColumn('songTitle')?.getFilterValue()
  return typeof filterValue === 'string' ? filterValue : ''
})

const tableFilterSongTitleUpdate = (val: string) => {
  table.value?.tableApi?.getColumn('songTitle')?.setFilterValue(val)
}

const rowSelectionInitial = computed(() => {
  const songs = props.playlist ? props.playlist.info.songs : []
  return Object.fromEntries(songs.map((song) => [song.hash, true]))
})

const formSchema = schemaBeatSaberPlaylist
  .omit({
    playlistDescription: true,
    songs: true,
    imageString: true,
  })
  .extend({
    image: z
      .union([schemaBeatSaberPlaylist.shape.imageString, z.instanceof(File)])
      .optional()
      .nullable(),
  })

type FormSchema = z.output<typeof formSchema>

const formState = reactive<FormSchema>({
  playlistTitle: props.playlist?.info?.playlistTitle ?? 'New playlist',
  playlistAuthor: props.playlist?.info?.playlistAuthor ?? '',
  image: fileGetBase64ImgUrl(props.playlist?.info?.imageString),
})

const playlistSaveAction = useAsyncAction(async () => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return

  const playlistRows = tableApi.getSelectedRowModel().rows
  if (!playlistRows) return

  const playlistSongItems: BeatSaberPlaylistSong[] = playlistRows.map((row) => {
    return {
      hash: row.original.hash,
      songName: row.original.songTitle,
    }
  })

  const playlistDataOld = props.playlist?.info
  const imageString = await beatSaberPlaylistImageFromFile(formState.image)

  const playlistDataNew: BeatSaberPlaylist = {
    playlistTitle: formState.playlistTitle,
    playlistAuthor: formState.playlistAuthor,
    playlistDescription: playlistDataOld?.playlistDescription ?? null,
    imageString,
    songs: playlistSongItems,
  }

  // Android FS is case insensitive, but preserves case from last write
  const nameChangedInsensitive =
    playlistDataNew.playlistTitle.toLowerCase() !== playlistDataOld?.playlistTitle?.toLowerCase()
  const nameChangedSensitive = playlistDataNew.playlistTitle !== playlistDataOld?.playlistTitle
  const exists = await storePlaylistManager.playlistExistsByTitle(playlistDataNew.playlistTitle)

  if (exists && nameChangedSensitive) {
    const overwrite = await confirm({
      title: `Overwrite?`,
      description: `Playlist with name ${playlistDataNew.playlistTitle} already exists.`,
    })
    if (!overwrite) return
  }

  await storePlaylistManager.playlistSave(playlistDataNew)

  if (nameChangedInsensitive && props.playlist) {
    await storePlaylistManager.playlistsRemove([props.playlist.dirEntry.name])
  }

  emit('close', true)
})

onBeforeMount(() => {
  songsDirFilesWithInfo.execute({ force: false })
})
</script>

<template>
  <UModal
    class="flex h-[95vh] min-w-5xl flex-col gap-2 divide-none lg:max-w-11/12 xl:max-w-8/12"
    :dismissible="false"
    description="Playlist editor"
  >
    <template #content>
      <UForm
        class="flex w-full items-start justify-between gap-4 px-6 pt-4"
        :schema="formSchema"
        :state="formState"
        @submit="playlistSaveAction.execute()"
      >
        <div class="flex gap-4">
          <UFormField>
            <InputFileImage
              v-model="formState.image"
              class="size-20"
              accept="image/*"
            />
          </UFormField>

          <UFormField
            label="Playlist name"
            name="playlistTitle"
          >
            <UInput
              v-model="formState.playlistTitle"
              class="w-full min-w-72"
            />
          </UFormField>

          <UFormField
            label="Playlist author"
            name="playlistAuthor"
          >
            <UInput
              v-model="formState.playlistAuthor"
              class="w-full min-w-60"
            />
          </UFormField>
        </div>

        <div class="mt-2 flex gap-4">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide:minus"
            :disabled="playlistSaveAction.status.value === 'pending'"
            @click="emit('close', false)"
            >Cancel</UButton
          >

          <UButton
            variant="subtle"
            color="success"
            icon="i-lucide:check"
            :loading="playlistSaveAction.status.value === 'pending'"
            type="submit"
            >Save</UButton
          >
        </div>
      </UForm>

      <div class="flex items-center gap-4 px-6 pt-4">
        <UInput
          class="max-w-sm min-w-[25ch]"
          placeholder="Filter songs..."
          autofocus
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

        <UCheckbox
          label="Show only selected"
          :modelValue="tableFilterSelected"
          @update:modelValue="tableFilterSelectedUpdate"
        />
      </div>

      <UTable
        ref="table"
        :rowSelection="rowSelectionInitial"
        :getRowId="(row: SongWithInfo) => row.hash"
        :data="songsDirFilesWithInfo.data.value ?? undefined"
        :columns="columns"
        sticky
        :loading="songsDirFilesWithInfo.status.value === 'pending'"
      />
    </template>
  </UModal>
</template>
