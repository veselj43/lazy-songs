<script setup lang="ts">
import { USkeleton } from '#components'
import { decodeUtf8 } from '@yume-chan/adb'
import AppHeader from '~/components/AppHeader.vue'
import { getFileType, type DirEntry, type FileType } from '~/lib/linuxUtils'
import { streamReadToBytes } from '~/lib/stream'
import { pathJoin } from '~/service/path.service'
import { useAdbStore } from '~/store/adb'
import { useConfigStore } from '~/store/config'

const storeConfig = useConfigStore()
const storeAdb = useAdbStore()

const entryTypeToIcon: Record<FileType, string> = {
  dir: 'i-lucide:folder',
  file: 'i-lucide:file',
  link: 'i-lucide:folder-symlink',
}

const dirPathCurrent = ref(storeConfig.pathSongs)

const dirItems = await useAsyncData(
  async () => {
    await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
    const result = await syncUse.sync.readdir(dirPathCurrent.value)
    return result
  },
  {
    watch: [dirPathCurrent],
  },
)

const dirItemsUi = computed(() => {
  const data = dirItems.data.value ?? []
  const entries = data
    .filter((entry) => entry.name !== '.' && entry.name !== '..')
    .map((entry) => ({
      name: entry.name,
      type: getFileType(entry.type),
      size: entry.size,
    }))
    .filter((entry): entry is DirEntry => !!entry.type)
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }

      return a.type.localeCompare(b.type)
    })

  entries.unshift({
    name: '..',
    type: 'dir',
    size: BigInt(0),
  })

  return entries
})

const dirEntrySelect = (dirEntry: DirEntry) => {
  if (dirEntry.type === 'file') {
    return
  }

  const pathNew = pathJoin(dirPathCurrent.value, dirEntry.name)
  dirPathCurrent.value = pathNew
}

const filePreview = shallowRef<{ name: string; content: string }>()
const filePreviewOpen = ref(false)

const fileRead = async (dirEntry: DirEntry) => {
  await using syncUse = await storeAdb.deviceAdbGetOrThrow().useSync()
  const pathFull = pathJoin(dirPathCurrent.value, dirEntry.name)
  const reader = syncUse.sync.read(pathFull)
  const bytes = await streamReadToBytes(reader)
  const text = decodeUtf8(bytes)

  filePreview.value = {
    name: pathFull,
    content: text,
  }
  filePreviewOpen.value = true
}
</script>

<template>
  <div class="flex max-h-full flex-col">
    <AppHeader>
      <template #left>
        <h1 class="text-3xl">Files</h1>

        <div>{{ dirPathCurrent }}</div>
      </template>
      <template #right>
        <UButton @click="dirPathCurrent = '/'">Go to root</UButton>
      </template>
    </AppHeader>

    <div
      v-if="dirItems.status.value === 'success'"
      class="overflow-y-auto"
    >
      <table class="w-full">
        <thead>
          <tr>
            <th />
            <th class="px-2 text-left">Name</th>
            <th class="px-2 text-center">Size</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in dirItemsUi"
            :key="entry.name"
            class="hover:bg-neutral-600/25"
          >
            <td
              class="w-8 cursor-pointer px-2 py-1 text-center align-middle"
              @click="dirEntrySelect(entry)"
            >
              <div class="grid place-items-center">
                <UIcon
                  :name="entryTypeToIcon[entry.type]"
                  size="18"
                />
              </div>
            </td>
            <td
              class="cursor-pointer px-2 py-1"
              @click="dirEntrySelect(entry)"
            >
              {{ entry.name }}
            </td>
            <td
              class="cursor-pointer px-2 py-1 text-right tabular-nums"
              @click="dirEntrySelect(entry)"
            >
              {{ entry.size }}
            </td>
            <td>
              <div class="flex items-center justify-end">
                <UButton
                  v-if="entry.type === 'file'"
                  variant="ghost"
                  size="sm"
                  @click="fileRead(entry)"
                  >Read</UButton
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="dirItems.status.value === 'pending'">
      <div class="mt-6 flex w-full flex-col gap-2">
        <div
          v-for="(x, i) in Array(5).fill(0)"
          :key="i"
          class="flex items-center gap-4 px-2 py-1"
        >
          <USkeleton class="size-4 rounded-md" />
          <USkeleton class="h-4 w-full" />
        </div>
      </div>
    </div>

    <UModal
      v-model:open="filePreviewOpen"
      fullscreen
      :title="`File preview: ${filePreview?.name}`"
    >
      <template #body>
        <div>
          <pre>{{ filePreview?.content }}</pre>
        </div>
      </template>
    </UModal>
  </div>
</template>
