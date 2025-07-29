<script setup lang="ts">
import type { Encoder } from '~/types/parameters'

defineProps<{
  loading?: boolean
  encoder: Encoder
}>()

const emit = defineEmits<{
  export: []
}>()

const modelValue = defineModel<string[]>({
  default: [],
})
</script>

<template>
  <div class="flex items-center justify-between w-full p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <CommandParameters
      v-model="modelValue"
      :encoder="encoder"
    />

    <UButton
      :loading="loading"
      icon="i-lucide-folder-down"
      @click="emit('export')"
    >
      Export
    </UButton>
  </div>
</template>
