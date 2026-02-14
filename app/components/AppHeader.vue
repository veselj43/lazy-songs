<template>
  <div class="my-4 flex items-center justify-between gap-2">
    <slot name="left">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl"><slot /></h1>
        <slot name="leftAppend" />
      </div>
    </slot>

    <div
      v-if="$slots.right"
      class="flex items-center gap-4"
    >
      <slot name="right" />
    </div>
  </div>
</template>
