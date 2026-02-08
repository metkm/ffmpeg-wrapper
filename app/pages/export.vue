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
  <div class="flex h-full w-full p-0!">
    <VideoRoot>
      <VideoPreview
        v-if="videoAssetUrl"
        :asset-url="videoAssetUrl"
        :path="videoPath"
        class="pb-dock-gap-for-content p-2"
      />

      <VideoExportOptions
        :path="videoPath"
        class="overflow-y-auto p-2 pb-dock-gap-for-content w-1/4"
      />
    </VideoRoot>
  </div>
</template>
