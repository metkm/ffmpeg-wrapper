<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Command } from '@tauri-apps/plugin-shell'
import { ref, useTemplateRef } from 'vue'

const videoUrl = ref('')
const videoRange = ref<[number, number]>([0, 1])
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
const crf = ref(21)

const playing = ref(false)
const videoRef = useTemplateRef('videoRef')

let videoPath: string | null = null

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
  videoPath = await open({
    multiple: false,
    directory: false,
  })

  if (!videoPath) return

  const fileSource = await convertFileSrc(videoPath)
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

const exportVideo = async () => {
  if (!videoPath) return

  const command = Command.sidecar('binaries/ffmpeg', [
    '-i',
    videoPath,
  ])

  const output = await command.execute()

  console.log(output)
}
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

        <div class="flex items-center gap-4 grow">
          <p>{{ formatSeconds(videoCurrentTime) }}</p>

          <div class="relative grow">
            <div
              class="w-2 bg-(--ui-bg-inverted) rounded-full absolute inset-y-0 z-10 pointer-events-none"
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

          <p>{{ formatSeconds(videoDuration) }}</p>
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

        <UButton
          icon="i-heroicons-film"
          @click="exportVideo"
        >
          Export
        </UButton>
      </div>
    </template>
  </main>
</template>
