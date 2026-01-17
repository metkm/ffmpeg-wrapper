<script setup lang="ts">
import { convertFileSrc } from '@tauri-apps/api/core'

definePageMeta({
  middleware: (to) => {
    if (!to.query.path) {
      return false
    }
  },
})

defineShortcuts({
  escape: () => navigateTo('/'),
})

const route = useRoute()

const videoAssetUrl = ref<string | undefined>()

const videoPath = computed(() => route.query.path!.toString())

onMounted(() => {
  videoAssetUrl.value = convertFileSrc(videoPath.value)
})
</script>

<template>
  <div class="flex-1 flex flex-col gap-4 max-w-video w-full mx-auto">
    <FileDrop
      class="fixed inset-0 z-50 pointer-events-none opacity-0"
      @select="(path) => navigateTo({ name: 'export', query: { path } })"
    />

    <VideoRoot>
      <VideoInfo
        :path="videoPath"
      />

      <VideoPreview
        v-if="videoAssetUrl"
        :asset-url="videoAssetUrl"
        :path="videoPath"
      />

      <VideoExportOptions
        :path="videoPath"
      />
    </VideoRoot>
  </div>
</template>

<style>
:root {
  --video-max-height: calc(100vh - var(--spacing) * 88);
}

.max-w-video {
  max-width: max(var(--container-2xl), calc(var(--video-max-height) * 16 / 9));
}
</style>
