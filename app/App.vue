<script setup lang="ts">
import { ref } from 'vue'
import { defaultVideoValues, parametersPerEncoders } from './constants'

import { getCurrentWindow } from '@tauri-apps/api/window'
import { convertFileSrc } from '@tauri-apps/api/core'

import type { Video } from './types/video'
import type { Encoder } from './types/parameters'
import { check } from '@tauri-apps/plugin-updater'

const toast = useToast()

const videoPath = ref<string>('')

const video = ref<Video>(defaultVideoValues)
const encoder = ref<Encoder>('h264_nvenc')

const videoUrl = computed(() => videoPath.value ? convertFileSrc(videoPath.value) : undefined)

const onExportEnd = () => {
  videoPath.value = ''
}

onMounted(() => {
  getCurrentWindow()
    .show()
})

onMounted(async () => {
  const update = await check()
  if (!update) return

  await update.downloadAndInstall(({ event }) => {
    if (event === 'Started') {
      toast.add({
        title: 'Update found',
        description: 'App will be automatically restarted when update is completed',
      })
    }
  })
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen w-screen overflow-x-hidden">
      <Suspense>
        <WindowOverlay />
      </Suspense>

      <main class="flex flex-col grow p-4 overflow-x-hidden overflow-y-auto space-y-4 scrollbar">
        <Transition
          enter-active-class="transition-all"
          leave-active-class="transition-all"
          leave-to-class="opacity-0"
          enter-from-class="opacity-0"
          mode="out-in"
        >
          <div
            v-if="!videoPath"
            class="flex flex-col grow"
          >
            <FileDrop
              v-model="videoPath"
              class="grow"
            />
          </div>

          <div
            v-else
            class="w-full max-w-4xl mx-auto space-y-4"
          >
            <VideoPreview
              v-if="videoUrl"
              v-model="video"
              :url="videoUrl"
              @close="onExportEnd"
            >
              <template #leading-title>
                <UButton
                  icon="i-lucide-x"
                  square
                  color="warning"
                  variant="soft"
                  @click="onExportEnd"
                >
                  Close
                </UButton>
              </template>
            </VideoPreview>

            <VideoExport
              :encoder="encoder"
              :video="video"
              :video-path="videoPath"
            >
              <UFormField
                label="Encoder"
                description="encoder that will be used to re-encode"
              >
                <USelect
                  v-model="encoder"
                  :items="Object.keys(parametersPerEncoders)"
                  class="w-full"
                />
              </UFormField>
            </VideoExport>
          </div>
        </Transition>
      </main>
    </div>
  </UApp>
</template>

<style>
.scrollbar::-webkit-scrollbar {
  display: block;
  width: calc(var(--spacing) * 3.5);
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--ui-bg-accented);
  border-radius: var(--radius-4xl);
  background-clip: padding-box;
  border: 3px solid transparent;
}

.scrollbar::-webkit-scrollbar-corner {
  display: none;
}

.scrollbar::-webkit-scrollbar:horizontal {
  display: none;
}

.scrollbar {
  scrollbar-gutter: stable both-edges;
}
</style>
