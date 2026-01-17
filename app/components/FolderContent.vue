<script setup lang="ts">
import { readDir } from '@tauri-apps/plugin-fs'
import { videoImportExtensions } from '~/constants'

const props = defineProps<{
  path: string
}>()

const videos = (await readDir(props.path))
  .filter((entry) => {
    const ext = entry.name.split('\\').at(-1)?.split('.').at(-1)
    if (!ext)
      return false

    return videoImportExtensions.includes(ext as typeof videoImportExtensions[number])
  })
  .slice(-10)
</script>

<template>
  <ol
    v-if="videos.length > 0"
    class="grid grid-cols-2"
  >
    <li
      v-for="video in videos"
      :key="video.name"
      class="p-2 hover:bg-muted rounded"
    >
      <FolderVideo
        :path="path"
        :entry="video"
      />
    </li>
  </ol>
  <UEmpty
    v-else
    icon="i-lucide-folder"
    title="No videos found"
    class="h-full"
    variant="naked"
  />
</template>
