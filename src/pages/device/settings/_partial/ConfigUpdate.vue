<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import AppHeader from '~/components/AppHeader.vue'
import { useAsyncAction } from '~/lib/asyncAction'
import { useAdbStore } from '~/store/adb'
import { useConfigStore } from '~/store/config'

const storeConfig = useConfigStore()
const storeAdb = useAdbStore()

const formSchema = z.object({
  pathPlaylists: z.string(),
  pathSongDataCache: z.string(),
  pathSongs: z.string(),
})

type FormSchema = z.output<typeof formSchema>

const formState = reactive<Partial<FormSchema>>({
  pathPlaylists: storeConfig.pathPlaylists,
  pathSongDataCache: storeConfig.pathSongDataCache,
  pathSongs: storeConfig.pathSongs,
})

const formSubmit = useAsyncAction(async (event: FormSubmitEvent<FormSchema>) => {
  storeConfig.pathsSet({
    pathPlaylists: event.data.pathPlaylists,
    pathSongDataCache: event.data.pathSongDataCache,
    pathSongs: event.data.pathSongs,
  })
})

const resetToDefaults = () => {
  if (!storeAdb.device?.device) return

  storeConfig.resetForDevice(storeAdb.device.device)
}
</script>

<template>
  <div>
    <AppHeader>
      Settings

      <template #right>
        <UButton
          variant="ghost"
          color="warning"
          @click="resetToDefaults()"
          >Reset</UButton
        >
      </template>
    </AppHeader>

    <div>
      <UForm
        class="flex flex-col gap-4"
        :schema="formSchema"
        :state="formState"
        @submit="formSubmit.execute"
      >
        <UFormField
          label="Path to playlists"
          name="pathPlaylists"
        >
          <UInput
            v-model="formState.pathPlaylists"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Path to CachedSongData.json (SongLoader mod)"
          name="pathSongDataCache"
        >
          <UInput
            v-model="formState.pathSongDataCache"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Path to songs"
          name="pathSongs"
        >
          <UInput
            v-model="formState.pathSongs"
            class="w-full"
          />
        </UFormField>

        <div>
          <UButton
            type="submit"
            :loading="formSubmit.status.value === 'pending'"
            >Save</UButton
          >
        </div>
      </UForm>
    </div>
  </div>
</template>
