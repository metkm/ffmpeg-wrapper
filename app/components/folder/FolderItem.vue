<script setup lang="ts">
defineProps<{
  path: string
}>()
</script>

<template>
  <NuxtLink
    :to="{ name: 'folder', query: { path } }"
    class="flex flex-col hover:bg-muted rounded-(--ui-radius) p-2"
  >
    <UIcon
      name="i-lucide-folder"
      class="size-20 mx-auto"
    />

    <p class="truncate text-sm text-center">
      {{ path.split('\\').slice(-1).join('\\') }}
    </p>
  </NuxtLink>
</template>
