<script setup lang="ts">
import { motion } from 'motion-v'
import { defaultVideoValues } from '~/constants'
import type { Video } from '~/types/video'

defineProps<{
  src: string
}>()

const showCrop = ref(false)

defineShortcuts({
  c: () => {
    showCrop.value = !showCrop.value
  },
})

const videoModel = defineModel<Video>({
  default: defaultVideoValues,
})

const indicatorElement = useTemplateRef('indicatorElement')
const indicatorElementSize = useElementSize(indicatorElement)

const indicatorElementContainer = useTemplateRef('indicatorElementContainer')
const indicatorElementContainerSize = useElementSize(indicatorElementContainer)

const videoContainerElement = useTemplateRef('videoContainerElement')
const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const { x: indicatorX, style: indicatorElementStyle } = useDraggable(indicatorElement, {
  axis: 'x',
  containerElement: indicatorElementContainer,
  preventDefault: true,
  onMove: ({ x }) => {
    if (!videoElement.value) return
    videoElement.value.currentTime = range(0, videoContainerElement.value!.clientWidth, 0, videoModel.value.duration, x)
  },
})

const rangeStart = computed(() => formatSeconds(videoModel.value.durationRange[0]!))
const rangeEnd = computed(() => formatSeconds(videoModel.value.durationRange[1]!))

const handleLoad = () => {
  if (!videoElement.value) return
  videoModel.value.duration = videoElement.value.duration
  videoModel.value.durationRange = [0, videoElement.value.duration]

  videoModel.value.crop.width = videoElement.value.videoWidth
  videoModel.value.crop.height = videoElement.value.videoHeight

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

const togglePlay = () => {
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

const indicatorOffset = computed(() => {
  const thumbWidthHalf = 12 / 2
  const indicatorWidthHalf = indicatorElementSize.width.value / 2

  const indicatorContainerWidth = indicatorElementContainerSize.width.value
  const indicatorContainerWidthHalf = indicatorElementContainerSize.width.value / 2

  const targetOffset = thumbWidthHalf - indicatorWidthHalf

  if (indicatorX.value < indicatorContainerWidthHalf) {
    return range(0, indicatorContainerWidthHalf, targetOffset, 0, indicatorX.value)
  }

  return range(indicatorContainerWidthHalf, indicatorContainerWidth, 0, -targetOffset, indicatorX.value)
})

const updateIndicatorX = (value: number) => {
  const containerWidthWithoutIndicator = indicatorElementContainerSize.width.value - indicatorElementSize.width.value
  indicatorX.value = range(0, videoModel.value.duration, 0, containerWidthWithoutIndicator, value)
}

watch(indicatorElementContainerSize.width, () => {
  updateIndicatorX(videoModel.value.currentTime)
})

watch(
  () => videoModel.value.durationRange,
  (durationRange, oldDurationRange) => {
    if (!videoElement.value) return

    const start = durationRange[0]
    const end = durationRange[1]

    if (start !== oldDurationRange[0]) {
      videoElement.value.currentTime = start
      updateIndicatorX(start)
    } else {
      videoElement.value.currentTime = end
      updateIndicatorX(end)
    }
  },
)
</script>

<template>
  <section class="space-y-4">
    <div class="font-medium text-muted">
      <motion.p
        layout-id="hovering-path"
        class="truncate z-10"
      >
        {{ decodeURI(src).split('\\').at(-1) }}
      </motion.p>

      <p class="text-xs">
        (press <UKbd>C</UKbd> to toggle crop)
      </p>
    </div>

    <div
      ref="videoContainerElement"
      class="relative flex items-center gap-4 rounded-(--ui-radius) overflow-hidden w-full aspect-video opacity-0"
    >
      <div class="rounded-(--ui-radius) overflow-hidden">
        <VideoCrop
          v-if="showCrop"
          v-model="videoModel.crop"
          :width="videoElement?.videoWidth"
          :height="videoElement?.videoHeight"
          class="z-10"
        />

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
            @click="togglePlay"
          />

          <p class="hidden sm:block text-sm font-medium text-center w-32">
            {{ rangeStart }} / {{ rangeEnd }}
          </p>

          <div
            ref="indicatorElementContainer"
            class="flex-1 relative"
          >
            <div
              ref="indicatorElement"
              class="absolute w-1 h-3 mt-3.5 bg-primary shadow rounded-full z-10"
              :style="[indicatorElementStyle, { transform: `translateX(${indicatorOffset}px)` }]"
            />

            <USlider
              v-model="videoModel.durationRange"
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
