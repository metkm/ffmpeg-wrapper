<script setup lang="ts">
import { defaultVideoValues } from '~/constants'
import type { VideoValues } from '~/types/video'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  export: []
}>()

const videoModel = defineModel<VideoValues>({
  default: defaultVideoValues,
})
</script>

<template>
  <div class="flex items-center justify-between w-full p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <UFormField
      label="CRF"
      help="How much lossless video should be"
    >
      <UInputNumber
        v-model="videoModel.crf"
        :min="0"
        :max="51"
        variant="soft"
        color="neutral"
      />
    </UFormField>

    <UButton
      :loading="loading"
      icon="i-lucide-folder-down"
      @click="emit('export')"
    >
      Export
    </UButton>
  </div>
</template>
