<script setup lang="ts">
import { motion } from 'motion-v'
import { defaultVideoValues } from '~/constants'
import type { Video } from '~/types/video'

defineProps<{
  src: string
}>()

const videoModel = defineModel<Video>({
  default: defaultVideoValues,
})

const videoContainerElement = useTemplateRef('videoContainerElement')
const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const rangeStart = computed(() => formatSeconds(videoModel.value.range[0]!))
const rangeEnd = computed(() => formatSeconds(videoModel.value.range[1]!))

const handleLoad = () => {
  if (!videoElement.value) return
  videoModel.value.duration = videoElement.value.duration
  videoModel.value.range = [0, videoElement.value.duration]

  if (videoContainerElement.value) {
    videoContainerElement.value.classList.add('fade-in')
    videoContainerElement.value.classList.remove('opacity-0')

    videoElement.value.classList.add('fade-in')
    videoElement.value.classList.remove('opacity-0')
  }
}

const handleTimeUpdate = () => {
  videoModel.value.currentTime = videoElement.value ? videoElement.value.currentTime : videoModel.value.currentTime
}

const toggle = () => {
  if (videoPlaying.value) {
    videoElement.value?.pause()
    videoPlaying.value = false
  } else {
    videoElement.value?.play()
    videoPlaying.value = true
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoContainerElement.value?.requestFullscreen()
  }
}

const currentTimePercent = computed(() => {
  return videoModel.value.currentTime * 100 / videoModel.value.duration
})

const boundsOffset = computed(() => {
  const indicatorWidthHalf = 12 / 2

  if (currentTimePercent.value < 50) {
    return indicatorWidthHalf - range(0, 50, 0, indicatorWidthHalf, currentTimePercent.value)
  }

  return -range(50, 100, 0, indicatorWidthHalf, currentTimePercent.value)
})

watch(
  () => videoModel.value.range,
  (range, oldRange) => {
    if (!videoElement.value) return

    if (range[0] !== oldRange[0]) {
      videoElement.value.currentTime = range[0]
    } else {
      videoElement.value.currentTime = range[1]
    }
  },
)
</script>

<template>
  <section class="space-y-4">
    <motion.p
      layout-id="hovering-path"
      class="font-medium truncate text-muted z-10"
    >
      {{ decodeURI(src).split('\\').at(-1) }}
    </motion.p>

    <div
      ref="videoContainerElement"
      class="relative flex items-center gap-4 rounded-(--ui-radius) overflow-hidden w-full aspect-video opacity-0"
    >
      <div class="rounded-(--ui-radius) overflow-hidden">
        <video
          ref="videoElement"
          :src="src"
          class="aspect-video rounded-(--ui-radius) overflow-hidden w-full opacity-0"
          @loadeddata="handleLoad"
          @timeupdate="handleTimeUpdate"
        />
      </div>

      <div class="p-4 absolute bottom-0 inset-x-0  bg-gradient-to-t from-black">
        <div class="flex items-center gap-2 rounded-full">
          <UButton
            :icon="videoPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
            color="neutral"
            size="sm"
            variant="ghost"
            :ui="{ leadingIcon: 'drop-shadow-lg shadow-black' }"
            @click="toggle"
          />

          <p class="hidden sm:block text-sm font-medium text-center">
            {{ rangeStart }} / {{ rangeEnd }}
          </p>

          <div class="flex-1 relative mx-2">
            <div
              class="absolute w-1 h-3 mt-3.5 bg-primary shadow rounded-full z-10 pointer-events-none transition-all"
              :style="{
                left: `calc(${currentTimePercent}% + ${boundsOffset}px)`,
                transform: 'translateX(-50%)',
              }"
            />

            <USlider
              v-model="videoModel.range"
              color="neutral"
              :min="0"
              :max="videoModel.duration"
              size="xs"
              class="flex-1"
              :min-steps-between-thumbs="1"
              :ui="{
                track: 'shadow opacity-85',
              }"
            />
          </div>

          <UButton
            icon="i-lucide-fullscreen"
            size="sm"
            variant="ghost"
            color="neutral"
            @click="toggleFullscreen"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation-name: fade-in;
  animation-timing-function: ease-out;
  animation-duration: 500ms;
}
</style>
