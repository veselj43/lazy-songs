<script setup lang="ts">
import type { DownloadSongStatus } from './interface'

defineProps<{
  status: DownloadSongStatus
}>()

const downloadSongStateToIcon: Record<DownloadSongStatus, { icon: string; class?: string }> = {
  initial: {
    class: 'text-neutral-400',
    icon: 'i-solar:hashtag-square-linear',
  },
  download: {
    class: 'text-info-300',
    icon: 'i-solar:download-square-linear',
  },
  unzip: {
    class: 'text-info-300',
    icon: 'i-solar:zip-file-linear',
  },
  copy: {
    class: 'text-info-300',
    icon: 'i-solar:send-square-linear',
  },
  done: {
    class: 'text-success-300',
    icon: 'i-solar:check-square-linear',
  },
  error: {
    class: 'text-error-300',
    icon: 'i-solar:close-square-linear',
  },
}
</script>

<template>
  <UIcon
    :class="downloadSongStateToIcon[status].class"
    :name="downloadSongStateToIcon[status].icon"
    :title="status"
  />
</template>
