<script setup lang="ts">
import { stat, type FileInfo } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

const props = defineProps<{
  path: string
}>()

const image = ref<string>()
const stats = ref<FileInfo>(await stat(props.path))

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
    <div class="space-y-2 p-2 relative after:-z-10 after:absolute after:inset-0 after:bg-elevated after:rounded-md after:opacity-0 after:scale-90 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:will-change-[transform,opacity]">
      <div class="aspect-video bg-elevated rounded-md">
        <img
          v-if="image"
          :src="image"
          class="w-full h-full rounded-md"
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

      <div class="text-sm">
        <p>
          {{ name.join() }}
        </p>

        <p class="text-xs text-muted mt-1">
          {{ stats?.mtime?.toLocaleString() }}
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
