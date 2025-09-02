<script setup lang="ts">
import { convertFileSrc } from '@tauri-apps/api/core'
import { defaultVideoValues } from '~/constants'
import type { Video } from '~/types/video'

definePageMeta({
  middleware: (to) => {
    if (!to.query.path) {
      return false
    }
  },
})

const route = useRoute()

const video = ref<Video>(defaultVideoValues)

const src = computed(() => convertFileSrc(route.query.path!.toString()))
</script>

<template>
  <div class="flex-1 flex flex-col gap-14 max-w-video w-full mx-auto">
    <FileDrop
      class="fixed inset-0 z-50 pointer-events-none opacity-0"
      @select="(path) => navigateTo({ name: 'export', query: { path } })"
    />

    <VideoPreview
      v-model="video"
      :src="src"
    />

    <VideoExport
      :video="video"
      :path="route.query.path!.toString()"
    />
  </div>
</template>

<style>
:root {
  --video-max-height: calc(100vh - var(--spacing) * 64);
}

.max-h-video {
  max-height: var(--video-max-height);
}

.max-w-video {
  max-width: calc(var(--video-max-height) * 16 / 9);
}
</style>
