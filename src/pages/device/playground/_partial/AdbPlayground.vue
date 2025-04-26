<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { streamFromString, streamPipeUnzip } from '~/lib/stream'
import { adbSyncPathExists } from '~/lib/webUsbAdb'
import { injectAdbCurrent } from '~/service/adb.provider'
import { fileNameNoExt, pathJoin } from '~/service/path.service'

const adb = injectAdbCurrent()
const sync = await adb.value.sync()

const fileRef = ref<{ inputRef: HTMLInputElement }>()

const PATH_TEST = '/storage/self/primary/_test'

const test = async () => {
  const path = pathJoin(PATH_TEST, 'a.txt')

  const fileExists = await adbSyncPathExists(sync, path)

  if (!fileExists) {
    console.log('File already exists')
    return
  }

  const stream = streamFromString('hello file')

  await sync.write({
    filename: path,
    file: stream,
  })

  console.log('File created')
}

const transferZipContentsTest = async () => {
  const file = fileRef.value?.inputRef?.files?.[0]
  if (!file) return

  const zipDirPath = pathJoin(PATH_TEST, fileNameNoExt(file.name))
  const dirExists = await adbSyncPathExists(sync, zipDirPath)

  if (dirExists) {
    console.log('Already exists')
    return
  }

  const entries = streamPipeUnzip(file.stream())

  for await (const entry of entries) {
    if (entry.directory) {
      console.log(entry.filename, 'skipped - dir')
      continue
    }

    const filePath = pathJoin(zipDirPath, entry.filename)

    if (!entry.readable) {
      console.log(entry.filename, 'skipped - no content')
      continue
    }

    await sync.write({
      filename: filePath,
      file: entry.readable,
    })

    console.log(entry.filename, 'written')
  }

  console.log('done')
}
</script>

<template>
  <div>
    <AppHeader>
      <template #default>Playground</template>
      <template #right>
        <UButton
          class="cursor-pointer"
          @click="test()"
          >Test</UButton
        >
      </template>
    </AppHeader>

    <div>
      <UInput
        ref="fileRef"
        class="w-full"
        :ui="{
          base: 'cursor-pointer',
        }"
        type="file"
        accept=".zip"
      />

      <UButton @click="transferZipContentsTest()">Transfer</UButton>
    </div>
  </div>
</template>
