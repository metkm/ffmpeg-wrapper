<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { readDir, stat, type DirEntry, type FileInfo } from '@tauri-apps/plugin-fs'
import { useIDB } from '~/hooks/useIDB'

const props = defineProps<{
  path: string
}>()

type Video = { thumbnail?: string } & FileInfo & DirEntry

const { get, put } = useIDB<number[]>('thumbnails')

const videos = ref<Video[]>([])

onMounted(async () => {
  const _entries = await readDir(props.path)

  const entriesWithStats = await Promise.all(
    _entries.slice(-10).map(async (entry) => {
      const stats = await stat(`${props.path}\\${entry.name}`)

      return {
        ...entry,
        ...stats,
      }
    },
    ),
  )

  entriesWithStats.sort((a, b) => (b.mtime?.getTime() || 1) - (a.mtime?.getTime() || 1))
  videos.value.push(...entriesWithStats)

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
      }
    })

    const videosWithThumbnail = await Promise.all(promises)
    videos.value.splice(index, chunkSize, ...videosWithThumbnail)
  }
})
</script>

<template>
  <section class="rounded">
    <div class="sticky top-0 p-4 flex bg-muted items-center gap-2">
      <UIcon
        name="i-lucide-folder"
        class="size-5"
      />

      <h1>
        {{ props.path }}
      </h1>
    </div>

    <ol class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 p-4">
      <li
        v-for="video in videos"
        :key="video.name"
        class="p-2 hover:bg-muted rounded"
      >
        <NuxtLink :to="{ path: '/export', query: { path: `${props.path}\\${video.name}` } }">
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

          <div class="text-sm mt-2">
            <p>
              {{ video.name }}
            </p>

            <p class="text-xs text-muted">
              {{ video.mtime?.toLocaleString() }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
