<script setup lang="ts">
import AdbFileExplorer from '~/components/AdbFileExplorer.vue'
import AdbProvider from '~/components/AdbProvider.vue'
import LayoutMain from '../_partial/LayoutMain.vue'
</script>

<template>
  <LayoutMain>
    <AdbProvider>
      <AdbFileExplorer />
    </AdbProvider>
  </LayoutMain>
</template>
