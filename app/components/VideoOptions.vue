<script setup lang="ts">
import type { Encoder } from '~/types/parameters'

const props = defineProps<{
  loading?: boolean
  encoder: Encoder
  duration: number
}>()

const emit = defineEmits<{
  export: []
}>()

const modelValue = defineModel<string[]>({
  default: [],
})

const targetFileSize = ref(10)
const targetBitrate = computed(() => targetFileSize.value * 8192 / props.duration - 320)
</script>

<template>
  <div class="flex gap-4 justify-between w-full p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <div class="flex gap-4 items-end">
      <CommandParameters
        v-model="modelValue"
        :encoder="encoder"
      />

      <UFormField
        label="target file size"
        :description="`${targetBitrate.toFixed(0)} bitrate`"
      >
        <UInputNumber
          v-model="targetFileSize"
          :min="0"
          variant="soft"
          color="neutral"
        />
      </UFormField>
    </div>

    <UButton
      :loading="loading"
      icon="i-lucide-folder-down"
      @click="emit('export')"
    >
      Export
    </UButton>
  </div>
</template>
