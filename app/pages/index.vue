<script setup lang="ts">
import { check } from '@tauri-apps/plugin-updater'
import { motion } from 'motion-v'

definePageMeta({
  name: 'upload',
})

const videoPath = ref<string>('')
const isUpdating = ref(false)
const progress = ref(0)

const onSelect = async () => {
  await navigateTo({
    name: 'export',
    query: {
      path: videoPath.value,
    },
  })
}

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
  <div class="flex flex-col grow relative -m-4">
    <!-- <AppColorMode class="right-4 top-4 absolute" /> -->

    <FileHistory class="" />

    <LayoutGroup>
      <AnimatePresence>
        <Motion
          layout
          as-child
        >
          <FileDrop
            v-model="videoPath"
            class="grow rounded-none"
            :disabled="isUpdating"
            @select="onSelect"
          />
        </Motion>

        <!-- <FileHistory class="absolute" /> -->

        <motion.div
          v-if="isUpdating"
          layout
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
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
    </LayoutGroup>
  </div>
</template>
