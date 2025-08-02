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
  <div class="flex flex-col gap-4 max-w-4xl mx-auto w-full p-4 relative">
    <VideoPreview
      v-model="video"
      :src="src"
      class="w-full"
    />

    <VideoExport
      :video="video"
      :path="route.query.path!.toString()"
    />
  </div>
</template>
