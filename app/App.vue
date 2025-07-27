<script setup lang="ts">
import { save } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Command } from '@tauri-apps/plugin-shell'
import { ref, useTemplateRef } from 'vue'

const video = reactive({
  range: [0, 1],
  duration: 0,
  seek: 0,
  crf: 21,
  url: '',
  path: '',
})

const loading = ref(false)
const stdoutLine = ref('')

const playing = ref(false)
const videoRef = useTemplateRef('videoRef')

const videoStartFormatted = computed(() => formatSeconds(video.range[0]!))
const videoEndFormatted = computed(() => formatSeconds(video.range[1]!))

const handleVideoLoad = () => {
  if (!videoRef.value) return

  video.range = [0, videoRef.value.duration]
  video.duration = videoRef.value.duration
}

const handleVideoTimeUpdate = () => {
  if (!videoRef.value) return
  video.seek = videoRef.value.currentTime
}

// const selectFile = async () => {
//   videoPath = await open({
//     multiple: false,
//     directory: false,
//   })

//   console.log(videoPath)
//   if (!videoPath) return

//   const fileSource = await convertFileSrc(videoPath)
//   videoUrl.value = fileSource
//   videoRef.value?.load()
// }

const toggleVideo = () => {
  if (playing.value) {
    videoRef.value?.pause()
  } else {
    videoRef.value?.play()
  }

  playing.value = !playing.value
}

watch(video.range, (value, prevValue) => {
  if (!videoRef.value) return

  const [start, end] = value
  const [oldStart, oldEnd] = prevValue

  if (start !== oldStart && start) {
    videoRef.value.currentTime = start
  } else if (end !== oldEnd && end) {
    videoRef.value.currentTime = end
  }
})

const exportVideo = async () => {
  if (!video.path) return
  loading.value = true

  const savePath = await save({
    filters: [
      {
        name: 'output',
        extensions: ['mp4'],
      },
    ],
  })

  if (!savePath) {
    loading.value = false
    return
  }

  const args = [
    '-y',
    '-i',
    video.path,
    '-crf',
    video.crf.toString(),
    '-ss',
    videoStartFormatted.value,
    '-to',
    videoEndFormatted.value,
    savePath,
  ]

  const command = Command.sidecar('binaries/ffmpeg', args)

  command.stdout.on('data', (line) => {
    stdoutLine.value = line
  })

  command.stderr.on('data', (line) => {
    stdoutLine.value = line
  })

  command.once('close', () => {
    command.removeAllListeners()
    loading.value = false
  })

  loading.value = true
  await command.spawn()
}

watch(() => video.path, async () => {
  video.url = convertFileSrc(video.path)
  videoRef.value?.load()
})
</script>

<template>
  <main class="p-4 overflow-hidden h-screen flex flex-col gap-8">
    <FileDrop
      v-if="!video.path"
      v-model="video.path"
    />

    <div
      v-if="video.url"
      class="flex overflow-hidden"
    >
      <video
        ref="videoRef"
        :src="video.url"
        class="h-full grow flex-1 max-h-full w-full"
        @loadeddata="handleVideoLoad"
        @timeupdate="handleVideoTimeUpdate"
      />
    </div>

    <template v-if="video.url">
      <div class="flex gap-4 items-center">
        <UButton
          :icon="playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
          @click="toggleVideo"
        />

        <div class="flex items-center gap-4 grow">
          <p>{{ videoStartFormatted }}</p>

          <div class="relative grow">
            <div
              class="w-2 bg-(--ui-bg-inverted) rounded-full absolute inset-y-0 z-10 pointer-events-none"
              :style="{
                left: `${video.seek * 100 / video.duration}%`,
                transform: 'translateX(-50%)',
              }"
            />

            <USlider
              v-model="video.range"
              :min="0"
              :max="video.duration"
            />
          </div>

          <p>{{ videoEndFormatted }} / {{ formatSeconds(video.duration) }}</p>
        </div>
      </div>

      <div class="flex gap-4 justify-between items-center">
        <div class="flex items-center gap-4">
          <UFormField
            label="Crf"
            help="How lossless video should be"
          >
            <UInputNumber
              v-model="video.crf"
              :min="0"
              :max="51"
            />
          </UFormField>
        </div>

        <UButton
          icon="i-heroicons-film"
          :loading="loading"
          @click="exportVideo"
        >
          Export
        </UButton>
      </div>

      <p class="p-2 bg-(--ui-bg-elevated) rounded-lg truncate">
        {{ stdoutLine }}
      </p>
    </template>
  </main>
</template>
