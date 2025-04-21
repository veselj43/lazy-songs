<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
</script>

<template>
  <div class="flex">
    <AppSidebar class="h-full w-48" />

    <div class="m-auto w-4xl px-5 py-3">
      <slot />
    </div>
  </div>
</template>
