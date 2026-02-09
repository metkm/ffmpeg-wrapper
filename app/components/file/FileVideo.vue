<script setup lang="tsx">
import { stat } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'
import { basename } from '@tauri-apps/api/path'

const props = defineProps<{
  path: string
}>()

const FileVideoName = defineComponent(async () => {
  const name = await basename(props.path)

  return () => (
    <p>{name}</p>
  )
})

const FileThumbnail = defineComponent(async () => {
  const buffer = await invoke<number[]>('get_file_thumbnail', { path: props.path })
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
  const url = URL.createObjectURL(blob)

  return () => {
    return (
      <img
        src={url}
        class="w-full h-full rounded-md object-contain"
      />
    )
  }
})

const FileModifyTime = defineComponent(async () => {
  const stats = await stat(props.path)

  return () => (
    <p class="text-xs text-muted mt-1">
      { stats.mtime?.toLocaleString() }
    </p>
  )
})
</script>

<template>
  <NuxtLink :to="{ name: 'export', query: { path } }">
    <div class="space-y-2 p-2 relative after:-z-10 after:absolute after:inset-0 after:bg-elevated after:rounded-md after:opacity-0 after:scale-90 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:will-change-[transform,opacity]">
      <div class="aspect-video bg-elevated rounded-md">
        <AppSuspense>
          <FileThumbnail />

          <template #fallback>
            <div class="h-full w-full flex items-center justify-center gap-2 text-muted">
              <UIcon
                name="i-lucide-loader-circle"
                class="size-5 animate-spin"
              />

              <p class="text-xs">Loading...</p>
            </div>
          </template>
        </AppSuspense>

      </div>

      <div class="text-sm">
        <AppSuspense>
          <FileVideoName />
        </AppSuspense>

        <AppSuspense>
          <FileModifyTime />
        </AppSuspense>
      </div>
    </div>
  </NuxtLink>
</template>
