<script setup lang="ts">
import { basename } from '@tauri-apps/api/path'

const props = defineProps<{
  path: string
}>()

const name = await basename(props.path)
</script>

<template>
  <UButton
    :to="{ name: 'folder', query: { path } }"
    icon="i-lucide-folder"
    variant="ghost"
    color="neutral"
    block
  >
    <UTooltip :text="name">
      <p class="truncate text-sm text-center">
        {{ name }}
      </p>
    </UTooltip>
  </UButton>
</template>
