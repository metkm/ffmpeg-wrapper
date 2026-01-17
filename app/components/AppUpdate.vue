<script setup lang="ts">
import { check } from '@tauri-apps/plugin-updater'

const isUpdating = ref(false)
const progress = ref(0)

onMounted(async () => {
  const update = await check()
  if (!update) return

  let contentLength = 0
  let downloaded = 0

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength ?? 0
        isUpdating.value = true
        break
      case 'Progress':
        downloaded += event.data.chunkLength
        break
      case 'Finished':
        isUpdating.value = false
        break
      default:
        isUpdating.value = false
        break
    }

    progress.value = downloaded * 100 / contentLength
  })
})
</script>

<template>
</template>
