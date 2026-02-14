<script setup lang="ts">
import { tvCn } from '~/lib/tailwind'

const props = withDefaults(
  defineProps<{
    accept?: string
    disabled?: boolean
    name?: string
  }>(),
  {
    accept: undefined,
    disabled: false,
    name: undefined,
  },
)

const attrs = useAttrs()
const classOverride = computed(() => (typeof attrs.class === 'string' ? attrs.class : undefined))

const inputRef = useTemplateRef('input')
const fileSelected = ref<File | null>() // null = deleted, undefined = not selected
const dragActive = ref(false)

const [model] = defineModel<File | string | null>()

const fileSelectedProps = computed(() => {
  const file = fileSelected.value !== undefined ? fileSelected.value : model.value
  if (!file) return

  if (typeof file === 'string') {
    return {
      isImage: true, // doesn't have to be, but too difficult to check
      previewImageUrl: file,
    }
  }

  const isImage = !!file && file.type.startsWith('image/')

  return {
    isImage,
    previewImageUrl: isImage ? URL.createObjectURL(file) : undefined,
    name: file.name,
  }
})

const dragHandle = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (props.disabled) return

  if (e.type === 'dragenter' || e.type === 'dragover') {
    dragActive.value = true
  } else if (e.type === 'dragleave') {
    dragActive.value = false
  }
}

const dropHandle = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  dragActive.value = false

  if (props.disabled) return

  const files = e.dataTransfer?.files

  if (files?.length) {
    fileSelected.value = files[0]

    if (inputRef.value) {
      inputRef.value.files = files
    }
  }
}

const changeHandle = (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files

  if (files?.length) {
    const file = files[0]
    fileSelected.value = file
  }
}

const fileRemove = () => {
  fileSelected.value = null
}

watch(fileSelected, () => {
  model.value = fileSelected.value
})
</script>

<template>
  <div
    :class="
      tvCn(
        'group relative grid size-15 place-items-center overflow-clip rounded-md border border-dashed not-disabled:cursor-pointer',
        dragActive && 'bg-neutral-500/20',
        classOverride,
      )
    "
    @click="() => inputRef?.click()"
    @keydown="(e) => ['Enter', 'Space'].includes(e.code) && inputRef?.click()"
    @dragenter="dragHandle"
    @dragleave="dragHandle"
    @dragover="dragHandle"
    @drop="dropHandle"
  >
    <input
      ref="input"
      class="hidden"
      type="file"
      :accept="accept"
      :disabled="disabled"
      @change="changeHandle"
    />

    <div
      v-if="fileSelectedProps"
      class="absolute hidden size-full bg-neutral-800/20 group-hover:block"
    >
      <UButton
        class="absolute top-1 right-1 size-6"
        variant="soft"
        color="error"
        size="sm"
        icon="i-lucide:x"
        @click.stop="fileRemove()"
      />
    </div>

    <UIcon
      v-if="!fileSelectedProps"
      name="i-lucide:upload"
    />

    <div
      v-else-if="fileSelectedProps.isImage"
      class="size-full bg-contain bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url(${fileSelectedProps.previewImageUrl})`,
      }"
    />

    <div v-else-if="fileSelectedProps.name">{{ fileSelectedProps.name }}</div>
  </div>
</template>
