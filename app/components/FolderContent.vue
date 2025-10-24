<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { useIDB } from '~/hooks/useIDB'

const props = defineProps<{
  path: string
}>()

interface FileVideo extends DirEntry {
  thumbnail?: string
}

const { get, put } = useIDB<number[]>('thumbnails')

const videos = ref<FileVideo[]>([])

onMounted(async () => {
  const entries = await readDir(props.path) as FileVideo[]
  videos.value.push(...entries)

  const chunkSize = 10

  for (let index = 0; index < videos.value.length; index += chunkSize) {
    const chunk = videos.value.slice(index, index + chunkSize)

    const promises = chunk.map(async (entry) => {
      const vPath = `${props.path}\\${entry.name}`

      const imageBufferCache = await get(vPath)
      const buffer = imageBufferCache || await invoke<number[]>('create_thumbnail', { videoPath: vPath })

      if (!imageBufferCache) {
        await put(buffer, vPath)
      }

      const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)

      return {
        ...entry,
        thumbnail: url,
      } as FileVideo
    })

    const videosWithThumbnail = await Promise.all(promises)
    videos.value.splice(index, chunkSize, ...videosWithThumbnail)
  }
})
</script>

<template>
  <section class="rounded">
    <div class="sticky top-0 p-4 bg-muted flex items-center gap-2 rounded mb-4">
      <UIcon
        name="i-lucide-folder"
        class="size-5"
      />

      <h1>
        {{ props.path }}
      </h1>
    </div>

    <ol class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      <li
        v-for="video in videos"
        :key="video.name"
      >
        <div class="aspect-video w-full rounded bg-elevated overflow-hidden">
          <img
            v-if="video.thumbnail"
            :src="video.thumbnail"
            class="w-full h-full"
          >

          <div
            v-else
            class="h-full w-full flex items-center justify-center"
          >
            <p>Loading...</p>
          </div>
        </div>

        <p class="text-sm mt-2">
          {{ video.name }}
        </p>
      </li>
    </ol>
  </section>
</template>
