<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import AppSidebar from '~/components/AppSidebar.vue'

const tvLayout = tv({
  base: 'h-full px-5 pt-3 pb-8',
  variants: {
    width: {
      narrow: 'm-auto w-full xl:max-w-6xl',
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
  <div class="flex h-screen flex-col">
    <div class="flex min-h-0 grow">
      <AppSidebar class="h-full w-48 shrink-0 overflow-y-auto" />

      <div :class="tvLayout({ width: props.width })">
        <slot />
      </div>
    </div>

    <div
      class="flex h-10 shrink-0 grow-0 items-center justify-center border-t border-t-gray-700 bg-neutral-950/10 text-sm text-gray-600"
    >
      <p>
        <a
          class="text-success-700 hover:underline"
          :href="$config.public.hrefGit"
          target="_blank"
          >GitHub</a
        >
      </p>

      <span class="px-2 text-gray-800">|</span>

      <p>
        Made by <span class="text-gray-500">LazyGod</span>, inspired by
        <a
          class="text-success-700 hover:underline"
          href="https://mbf.bsquest.xyz/"
          target="_blank"
          >ModsBeforeFriday</a
        >
      </p>
    </div>
  </div>
</template>
