<script setup lang="ts">
import { UAlert } from '#components'
import { useAdbStore } from '~/store/adb'
import DeviceSelect from './_partial/DeviceSelect.vue'

const storeAdb = useAdbStore()

const isBrowserSupported = computed(() => !!Symbol.asyncDispose && !!storeAdb.handler)
</script>

<template>
  <div class="relative grid h-screen justify-center p-10">
    <div class="mt-5 flex w-lg flex-col items-center gap-10 lg:w-xl">
      <h1 class="mb-2 text-4xl font-bold">Lazy songs</h1>

      <UCard variant="subtle">
        <div class="flex flex-col gap-2">
          <p class="mb-2 text-2xl">Simple manager for BeatSaber songs and playlists</p>

          <p>
            To use, you need to enable USB debugging in developer mode on your Quest device. If you don't have modded
            version of BeatSaber use
            <a
              class="text-success-600 hover:underline"
              href="https://mbf.bsquest.xyz/"
              target="_blank"
              >ModsBeforeFriday</a
            >.
          </p>

          <p>
            If you have modded version, but you don't see any device, make sure your Quest device is connected with
            USB-C cable and have developer mode enabled. <br />
            Here is
            <a
              class="text-success-600 hover:underline"
              href="https://developers.meta.com/horizon/documentation/native/android/mobile-device-setup/#enable-developer-mode"
              target="_blank"
              >how to enable it</a
            >.
          </p>
        </div>
      </UCard>

      <div v-if="!isBrowserSupported">
        <UAlert
          variant="soft"
          color="error"
          :ui="{
            title: 'text-lg',
            description: 'text-base',
          }"
          title="Sorry, but this app won't work in your browser."
          description="At this time this app uses some new techniques, that are supported only by Google Chrome 134 or newer and Edge 134 or newer."
        />
      </div>

      <template v-else>
        <DeviceSelect />

        <UAlert
          variant="soft"
          color="info"
          icon="i-lucide:info"
          :ui="{
            icon: 'mt-0.5 text-base',
          }"
          title="All data is handled locally in your browser."
          description="Only error events and page visits (anonymous) are collected to help with&nbsp;maintenance and future development."
        />
      </template>
    </div>

    <div class="absolute right-0 bottom-0 p-4">
      <a
        :href="$config.public.hrefGit"
        target="_blank"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE -->
          <path
            fill="currentColor"
            d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
