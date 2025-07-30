<script setup lang="ts">
import { ref } from 'vue'
import { defaultVideoValues, parametersPerEncoders } from './constants'

import { getCurrentWindow } from '@tauri-apps/api/window'
import { convertFileSrc } from '@tauri-apps/api/core'

import type { Video } from './types/video'
import type { Encoder } from './types/parameters'

const videoPath = ref<string>('')

const video = ref<Video>(defaultVideoValues)
const encoder = ref<Encoder>('av1_nvenc')

const videoUrl = computed(() => videoPath.value ? convertFileSrc(videoPath.value) : undefined)

const onExportEnd = () => {
  videoPath.value = ''
}

onMounted(() => {
  getCurrentWindow()
    .show()
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen">
      <Suspense>
        <WindowOverlay />
      </Suspense>

      <main class="flex flex-col grow p-4 pt-2 overflow-auto space-y-4 scrollbar">
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

            <AppVersion />
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
            />

            <div class="space-y-2">
              <UFormField
                label="Encoder"
                class="w-full max-w-xs"
              >
                <USelect
                  v-model="encoder"
                  :items="Object.keys(parametersPerEncoders)"
                  variant="soft"
                  class="w-full"
                />
              </UFormField>

              <VideoOptions
                :encoder="encoder"
                :video="video"
                :video-path="videoPath"
                @export-end="onExportEnd"
              />
            </div>
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
</style>
