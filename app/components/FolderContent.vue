<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { useIDB } from '~/hooks/useIDB'

const props = defineProps<{
  path: string
}>()

interface FileVideo extends DirEntry {
  thumbnail: string
}

const { get, put } = useIDB()

const evaluating = shallowRef(false)

const videoFiles = computedAsync(async () => {
  const entries = await readDir(props.path)

  const promises = entries.map(async (videoFile) => {
    const videoPath = `${props.path}\\${videoFile.name}`

    const cached = await get(videoPath)

    const array = cached ? cached.buffer : await invoke<number[]>('create_thumbnail', { videoPath })

    if (!cached) {
      await put(videoPath, array)
    }

    const buffer = new Uint8Array(array)
    const blob = new Blob([buffer], { type: 'image/jpeg' })

    const url = URL.createObjectURL(blob)

    return {
      ...videoFile,
      thumbnail: url,
    } satisfies FileVideo
  })

  return await Promise.all(promises)
}, null, evaluating)
</script>

<template>
  <ol
    v-if="!evaluating"
    class="grid grid-cols-3 gap-4 mb-10"
  >
    <li
      v-for="entry in videoFiles"
      :key="entry.name"
      class="p-2 bg-elevated rounded"
    >
      <img
        :src="entry.thumbnail"
        class="h-40 aspect-video rounded"
      >
      <p>{{ entry.name }}</p>
    </li>
  </ol>
  <p v-else>
    Loading {{ props.path }}
  </p>
</template>
