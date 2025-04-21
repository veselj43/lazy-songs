<script setup lang="ts">
import { USkeleton } from '#components'
import { getFileType, type DirEntry, type FileType } from '~/lib/linuxUtils'
import { injectAdbCurrent } from '~/service/adb.provider'
import AppHeader from './AppHeader.vue'

const adb = injectAdbCurrent()

const entryTypeToIcon: Record<FileType, string> = {
  dir: 'i-solar:folder-bold-duotone',
  file: 'i-solar:file-line-duotone',
  link: 'i-solar:link-square-line-duotone',
}

const sync = await adb.value.sync()

const dirPathCurrent = ref('/')

const dirItems = await useAsyncData(
  async () => {
    const result = await sync.readdir(dirPathCurrent.value)
    // console.log(dirPathCurrent.value, result)
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

  const pathSegments = dirPathCurrent.value.split('/').filter((segment) => !!segment)

  if (dirEntry.name === '..') {
    pathSegments.pop()
  } else {
    pathSegments.push(dirEntry.name)
  }

  const pathNew = '/' + pathSegments.join('/')
  dirPathCurrent.value = pathNew
}
</script>

<template>
  <div class="flex max-h-[90vh] flex-col">
    <AppHeader>
      <template #left>
        <h1 class="text-3xl">Files</h1>

        <div>{{ dirPathCurrent }}</div>
      </template>
      <template #right>
        <UButton
          class="cursor-pointer"
          @click="dirPathCurrent = '/'"
          >Go to root</UButton
        >
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
            class="hover:bg-neutral-50/10"
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
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="dirItems.status.value === 'pending'">
      <div class="flex flex-col gap-2">
        <div
          v-for="(x, i) in Array(5).fill(0)"
          :key="i"
          class="flex items-center gap-4 px-2 py-1"
        >
          <USkeleton class="size-4 rounded-md" />
          <USkeleton class="h-4 w-2xs" />
        </div>
      </div>
    </div>
  </div>
</template>
