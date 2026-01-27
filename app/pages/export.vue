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

const onSelect = (path: string) => {
  navigateTo({ name: 'export', query: { path } })
}

onMounted(() => {
  videoAssetUrl.value = convertFileSrc(videoPath.value)
})
</script>

<template>
  <UDashboardGroup class="absolute flex flex-1 w-full h-full">
    <UDashboardSidebar resizable>
      <p>sidebar content</p>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ root: 'min-h-full', body: 'max-w-[calc((100vh_-_32px_-_48px)_*_16/9)]' }">
      <template #body>
        <VideoRoot>
          <VideoPreview
            v-if="videoAssetUrl"
            :asset-url="videoAssetUrl"
            :path="videoPath"
          />
        </VideoRoot>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>

  <!-- <div class="flex-1 flex flex-col gap-4 max-w-video w-full mx-auto">
    <FileDrop
      class="fixed inset-0 z-50 pointer-events-none opacity-0"
      @select="onSelect"
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
  </div> -->
</template>
