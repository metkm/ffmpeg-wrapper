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

// const onSelect = (path: string) => {
//   navigateTo({ name: 'export', query: { path } })
// }

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
      <UDashboardPanel
        :ui="{ root: 'min-h-full', body: 'p-2 sm:p-2 pb-(--dock-height-padding) sm:pb-(--dock-height-padding) sm:gap-2' }"
      >
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
        :ui="{ body: 'pb-(--dock-height-padding)', root: 'min-h-full' }"
        :default-size="20"
      >
        <VideoExportOptions :path="videoPath" />
      </UDashboardSidebar>
    </VideoRoot>
  </UDashboardGroup>
</template>
