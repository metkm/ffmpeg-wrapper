<script setup lang="tsx">
import { invoke } from '@tauri-apps/api/core'
import { basename } from '@tauri-apps/api/path'
import { stat } from '@tauri-apps/plugin-fs'

const props = defineProps<{
  path: string
  isDirectory?: boolean
}>()

const Name = defineComponent(async () => {
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

const ModifyTime = defineComponent(async () => {
  const stats = await stat(props.path)

  return () => (
    <p class="text-xs text-muted">
      { stats.mtime?.toLocaleString() }
    </p>
  )
})
</script>

<template>
  <NuxtLink :to="{ name: props.isDirectory ? 'folder' : 'export', query: { path } }">
    <div class="h-full w-full">
      <div class="aspect-video bg-elevated rounded-md h-24 mx-auto w-full">
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

      <div class="text-sm pl-1 pt-1">
        <Name />
        <ModifyTime />
      </div>
    </div>
  </NuxtLink>
</template>
