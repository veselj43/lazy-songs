<script setup lang="ts">
import type { DownloadSongStatus } from './interface'

defineProps<{
  status: DownloadSongStatus
}>()

const downloadSongStateToIcon: Record<DownloadSongStatus, { icon: string; class?: string }> = {
  initial: {
    class: 'text-neutral-400',
    icon: 'i-lucide:circle-dashed',
  },
  toDownload: {
    class: 'text-neutral-300',
    icon: 'i-lucide:circle',
  },
  download: {
    class: 'text-info-300',
    icon: 'i-lucide:circle-arrow-down',
  },
  unzip: {
    class: 'text-info-300',
    icon: 'i-lucide:circle-dot',
  },
  copy: {
    class: 'text-info-300',
    icon: 'i-lucide:circle-arrow-left',
  },
  done: {
    class: 'text-success-300',
    icon: 'i-lucide:circle-check',
  },
  error: {
    class: 'text-error-300',
    icon: 'i-lucide:circle-x',
  },
}
</script>

<template>
  <UIcon
    :key="status"
    :class="downloadSongStateToIcon[status].class"
    :name="downloadSongStateToIcon[status].icon"
    :title="status"
  />
</template>
