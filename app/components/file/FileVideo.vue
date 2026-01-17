<script setup lang="ts">
import { stat, type FileInfo } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

const props = defineProps<{
  // entry: DirEntry
  path: string
}>()

const image = ref<string>()
const stats = ref<FileInfo>()

// const path = `${props.path}\\${props.entry.name}`

onMounted(async () => {
  try {
    const buffer = await invoke<number[]>('get_file_thumbnail', { path: props.path })

    const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
    image.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error(error, props.path)
  }
})

onMounted(async () => {
  stats.value = await stat(props.path)
})

const name = props.path.split('\\').slice(-1)
</script>

<template>
  <NuxtLink
    :to="{ name: 'export', query: { path } }"
    class="p-2"
  >
    <div class="aspect-video w-full rounded bg-elevated overflow-hidden">
      <img
        v-if="image"
        :src="image"
        class="w-full h-full"
      >

      <div
        v-else
        class="h-full w-full flex items-center justify-center gap-2 text-muted"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin"
        />

        <p class="text-xs">Loading...</p>
      </div>
    </div>

    <div class="text-sm mt-2">
      <p>
        {{ name.join() }}
      </p>

      <p class="text-xs text-muted mt-1">
        {{ stats?.mtime?.toLocaleString() }}
      </p>
    </div>
  </NuxtLink>
</template>
