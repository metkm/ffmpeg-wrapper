<script setup lang="ts">
const props = defineProps<{
  path: string
}>()

const folderName = props.path.split('\\').slice(-1).join('\\')
</script>

<template>
  <UButton
    :to="{ name: 'folder', query: { path } }"
    icon="i-lucide-folder"
    variant="ghost"
    color="neutral"
    block
  >
    <UTooltip :text="folderName">
      <p class="truncate text-sm text-center">
        {{ folderName }}
      </p>
    </UTooltip>
  </UButton>
</template>
