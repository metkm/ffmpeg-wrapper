<script setup lang="ts">
import { check } from '@tauri-apps/plugin-updater'
import { motion } from 'motion-v'

defineOptions({
  inheritAttrs: false,
})

const modelValueIsUpdating = defineModel<boolean>({ default: false })

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
        modelValueIsUpdating.value = true
        break
      case 'Progress':
        downloaded += event.data.chunkLength
        break
      case 'Finished':
        modelValueIsUpdating.value = false
        break
      default:
        modelValueIsUpdating.value = false
        break
    }

    progress.value = downloaded * 100 / contentLength
  })
})
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="modelValueIsUpdating"
      layout
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      v-bind="$attrs"
    >
      <p class="text-muted text-sm font-medium p-2">
        Installing update ({{ progress.toFixed(0) }}%)
      </p>

      <div class="h-1 w-full bg-muted">
        <div
          class="h-full bg-primary transition-all"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </motion.div>
  </AnimatePresence>
</template>
