<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import AppSidebar from '~/components/AppSidebar.vue'

const tvLayout = tv({
  slots: {
    pageWrapper: 'h-full w-full px-5 pt-3 pb-8',
    page: 'h-full',
  },
  variants: {
    scrollable: {
      true: {
        pageWrapper: 'overflow-y-auto',
      },
    },
    width: {
      narrow: {
        page: 'm-auto w-full xl:max-w-6xl',
      },
      wide: {
        page: 'w-full',
      },
    },
  },
})

type TvProps = VariantProps<typeof tvLayout>

const props = withDefaults(
  defineProps<{
    scrollable?: TvProps['scrollable']
    width?: TvProps['width']
  }>(),
  {
    scrollable: false,
    width: 'narrow',
  },
)

const styles = computed(() => tvLayout(props))
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="flex min-h-0 grow">
      <div class="relative h-full w-48 shrink-0">
        <AppSidebar class="w-full overflow-y-auto" />
      </div>

      <div :class="styles.pageWrapper()">
        <div :class="styles.page()">
          <slot />
        </div>
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
