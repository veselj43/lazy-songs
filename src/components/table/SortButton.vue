<script setup lang="ts">
import type { SortDirection } from '@tanstack/vue-table'

const props = defineProps<{
  label: string
  sortDirection: SortDirection | false
}>()

const emit = defineEmits<{
  sort: [SortDirection | false]
}>()

const sortToggle = () => {
  emit('sort', props.sortDirection)
}
</script>

<template>
  <UButton
    class="-mx-2.5"
    color="neutral"
    variant="ghost"
    :label="label"
    :icon="
      sortDirection
        ? sortDirection === 'asc'
          ? 'i-lucide:arrow-up-narrow-wide'
          : 'i-lucide:arrow-down-wide-narrow'
        : 'i-lucide:arrow-up-down'
    "
    @click="sortToggle"
  />
</template>
