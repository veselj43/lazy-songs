<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import AppSidebar from '~/components/AppSidebar.vue'

const tvLayout = tv({
  variants: {
    width: {
      narrow: 'm-auto w-4xl',
      wide: 'w-full',
    },
  },
})

type TvProps = VariantProps<typeof tvLayout>

const props = withDefaults(
  defineProps<{
    width?: TvProps['width']
  }>(),
  {
    width: 'narrow',
  },
)
</script>

<template>
  <div class="flex h-screen">
    <AppSidebar class="h-full w-48" />

    <div :class="tvLayout({ class: 'px-5 py-3', width: props.width })">
      <slot />
    </div>
  </div>
</template>
