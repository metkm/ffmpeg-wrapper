<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  cancel: []
  export: []
}>()
</script>

<template>
  <div class="flex justify-between w-full p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <UButton
      icon="i-lucide-x"
      color="error"
      @click="emit('cancel')"
    >
      Cancel
    </UButton>

    <UButton
      :loading="loading"
      icon="i-lucide-folder-down"
      @click="emit('export')"
    >
      Export
    </UButton>
  </div>
</template>
