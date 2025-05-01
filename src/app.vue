<script setup lang="ts">
useHead({
  titleTemplate: (pageName) => {
    return pageName ? `LazySongs | ${pageName}` : 'LazySongs'
  },
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
