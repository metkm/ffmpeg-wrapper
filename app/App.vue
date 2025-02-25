<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { ref, useTemplateRef } from 'vue'

const videoUrl = ref('')
const videoRange = ref<[number, number]>([0, 1])
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
const crf = ref(21)

const playing = ref(false)

const videoRef = useTemplateRef('videoRef')

const handleVideoLoad = () => {
  if (!videoRef.value) return

  videoRange.value = [0, videoRef.value.duration]
  videoDuration.value = videoRef.value.duration
}

const handleVideoTimeUpdate = () => {
  if (!videoRef.value) return
  videoCurrentTime.value = videoRef.value.currentTime
}

const selectFile = async () => {
  const path = await open({
    multiple: false,
    directory: false,
  })

  if (!path) return

  const fileSource = await convertFileSrc(path)
  videoUrl.value = fileSource
  videoRef.value?.load()
}

const toggleVideo = () => {
  if (playing.value) {
    videoRef.value?.pause()
  } else {
    videoRef.value?.play()
  }

  playing.value = !playing.value
}

watch(videoRange, (value, prevValue) => {
  if (!videoRef.value) return

  const [start, end] = value
  const [oldStart, oldEnd] = prevValue

  if (start !== oldStart) {
    videoRef.value.currentTime = start
  } else if (end !== oldEnd) {
    videoRef.value.currentTime = end
  }
})
</script>

<template>
  <main class="p-4 overflow-hidden h-screen flex flex-col gap-8">
    <UButton @click="selectFile">
      Select video file
    </UButton>

    <div class="flex overflow-hidden">
      <video
        v-if="videoUrl"
        ref="videoRef"
        :src="videoUrl"
        class="h-full grow flex-1 max-h-full w-full"
        @loadeddata="handleVideoLoad"
        @timeupdate="handleVideoTimeUpdate"
      />
    </div>

    <template v-if="videoUrl">
      <div class="flex gap-4 items-center">
        <UButton
          :icon="playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
          @click="toggleVideo"
        />

        <div class="grow relative">
          <div
            class="w-2 bg-(--ui-bg-inverted) rounded-full absolute inset-y-0 z-10"
            :style="{
              left: `${videoCurrentTime * 100 / videoDuration}%`,
              transform: 'translateX(-50%)',
            }"
          />

          <USlider
            v-model="videoRange"
            :min="0"
            :max="videoDuration"
          />
        </div>
      </div>

      <div class="flex gap-4 justify-between items-center">
        <UFormField
          label="Crf"
          help="How lossless video should be"
        >
          <UInputNumber
            v-model="crf"
            :min="0"
            :max="51"
          />
        </UFormField>

        <UButton icon="i-heroicons-film">
          Export
        </UButton>
      </div>
    </template>
  </main>
</template>
