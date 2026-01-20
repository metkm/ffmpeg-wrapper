<script setup lang="ts">
import { stat, type FileInfo } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

const props = defineProps<{
  path: string
}>()

const image = ref<string>()
const stats = ref<FileInfo>(await stat(props.path))

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

const name = props.path.split('\\').slice(-1)
</script>

<template>
  <NuxtLink :to="{ name: 'export', query: { path } }">
    <div class="aspect-video bg-elevated rounded-lg">
      <img
        v-if="image"
        :src="image"
        class="w-full h-full rounded-lg"
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

    <div class="text-sm p-2">
      <p>
        {{ name.join() }}
      </p>

      <p class="text-xs text-muted mt-1">
        {{ stats?.mtime?.toLocaleString() }}
      </p>
    </div>
  </NuxtLink>
</template>
