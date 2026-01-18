<script setup lang="ts">
const props = defineProps<{
  path: string
}>()

const folderName = props.path.split('\\').slice(-1).join('\\')
</script>

<template>
  <NuxtLink
    :to="{ name: 'folder', query: { path } }"
    class="grow flex flex-col justify-center rounded-lg p-2 size-28"
  >
    <UIcon
      name="i-lucide-folder"
      class="w-full h-1/2"
    />

    <UTooltip :text="folderName">
      <p class="truncate text-sm text-center">
        {{ folderName }}
      </p>
    </UTooltip>
  </NuxtLink>
</template>
