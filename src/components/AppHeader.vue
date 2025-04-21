<template>
  <div class="my-4 flex items-center justify-between gap-2">
    <slot name="left">
      <h1 class="text-3xl"><slot /></h1>
    </slot>

    <div v-if="$slots.right">
      <slot name="right" />
    </div>
  </div>
</template>
