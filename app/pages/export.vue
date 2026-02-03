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
  <UDashboardGroup
    class="absolute flex flex-1 w-full h-full"
    :unit="'rem'"
  >
    <VideoRoot>
      <UDashboardPanel :ui="{ root: 'min-h-0', body: 'sm:p-2 overflow-hidden relative pb-dock-height sm:pb-dock-height' }">
        <template #body>
          <VideoPreview
            v-if="videoAssetUrl"
            :asset-url="videoAssetUrl"
            :path="videoPath"
          />
        </template>
      </UDashboardPanel>

      <UDashboardSidebar
        side="right"
        :ui="{ body: 'pb-dock-height p-2', root: 'min-h-full' }"
        :default-size="20"
        :max-size="40"
        resizable
      >
        <VideoExportOptions :path="videoPath" />
      </UDashboardSidebar>
    </VideoRoot>
  </UDashboardGroup>
</template>
