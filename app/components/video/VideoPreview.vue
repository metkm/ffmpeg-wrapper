<script setup lang="ts">
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

const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const { x: indicatorX, style: indicatorElementStyle, isDragging } = useDraggable(indicatorElement, {
  axis: 'x',
  containerElement: indicatorElementContainer,
  preventDefault: true,
  onMove: ({ x }) => {
    if (!videoElement.value) return
    videoElement.value.currentTime = range(0, indicatorElementContainerSize.width.value - indicatorElementSize.width.value, 0, videoModel.value.duration, x)
  },
})

const rangeStart = computed(() => formatSeconds(videoModel.value.durationRange[0]!))
const rangeEnd = computed(() => formatSeconds(videoModel.value.durationRange[1]!))

const handleLoad = (event: Event) => {
  const element = videoElement.value ?? event.target as HTMLVideoElement

  videoModel.value.duration = element.duration
  videoModel.value.durationRange = [0, Math.round(element.duration)]

  videoModel.value.crop.width = element.videoWidth
  videoModel.value.crop.height = element.videoHeight
  videoModel.value.currentTime = 0
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

const indicatorOffset = computed(() => {
  const x = indicatorX.value || 0 // indicatorX is NAN on mount for some reason

  const thumbWidthHalf = 12 / 2
  const indicatorWidthHalf = indicatorElementSize.width.value / 2

  const indicatorContainerWidth = indicatorElementContainerSize.width.value
  const indicatorContainerWidthHalf = indicatorElementContainerSize.width.value / 2

  const targetOffset = thumbWidthHalf - indicatorWidthHalf

  if (x <= indicatorContainerWidthHalf) {
    return range(0, indicatorContainerWidthHalf, targetOffset, 0, x)
  }

  return range(indicatorContainerWidthHalf, indicatorContainerWidth, 0, -targetOffset, x)
})

const updateIndicatorX = (time: number) => {
  const containerWidthWithoutIndicator = indicatorElementContainerSize.width.value - indicatorElementSize.width.value
  indicatorX.value = range(0, videoModel.value.duration, 0, containerWidthWithoutIndicator, time)
}

watch(
  [
    () => indicatorElementContainerSize.width.value,
    () => videoModel.value.currentTime,
  ],
  () => {
    if (isDragging.value) return
    updateIndicatorX(videoModel.value.currentTime)
  })

watch(
  () => videoModel.value.durationRange,
  ([start, end], [oldStart, oldEnd]) => {
    if (!videoElement.value || oldEnd === 1)
      return

    if (start !== oldStart) {
      videoElement.value.currentTime = start
      updateIndicatorX(start)
    } else if (end !== oldEnd) {
      videoElement.value.currentTime = end
      updateIndicatorX(end)
    }
  },
)
</script>

<template>
  <section class="space-y-4">
    <div class="font-medium text-muted w-full mx-auto">
      <p class="truncate z-10">
        {{ decodeURI(src).split('\\').at(-1) }}
      </p>

      <p class="text-xs">
        (press <UKbd>C</UKbd> to toggle crop)
      </p>
    </div>

    <div class="flex flex-col items-center space-y-4">
      <div class="relative w-full aspect-video">
        <video
          ref="videoElement"
          :src="src"
          class="rounded-(--ui-radius) shadow shadow-black aspect-video"
          @loadeddata="handleLoad"
          @timeupdate="handleTimeUpdate"
        />

        <div
          class="absolute inset-0"
          @click="togglePlay"
        />
      </div>

      <div class="flex items-center gap-4 w-full">
        <UButton
          :icon="videoPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
          size="xl"
          class="shadow shadow-black"
          @click="togglePlay"
        />

        <div class="w-full -mt-1">
          <p class="text-xs mb-1.5">
            {{ rangeStart }} / {{ rangeEnd }}
          </p>

          <div
            ref="indicatorElementContainer"
            class="flex-1 relative"
          >
            <div
              ref="indicatorElement"
              class="absolute flex flex-col items-center !top-full"
              :style="[indicatorElementStyle, { transform: `translateX(${indicatorOffset}px)` }]"
            >
              <div class="relative h-2 w-1 bg-primary sq" />
              <div class="size-4 bg-primary rounded-b-full rounded-t-full" />
            </div>

            <USlider
              v-model="videoModel.durationRange"
              :min="0"
              :max="videoModel.duration"
              :min-steps-between-thumbs="1"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.sq::before, .sq::after {
  content: "";
  width: 44px;
  height: 34px;
  position: absolute;
  bottom: -4px;
  background-color: inherit;

  /* mask-image:
    linear-gradient(to top, black, black),
    radial-gradient(ellipse 24px 24px, green calc(100% - 1px), transparent); */

  mask-image:
    linear-gradient(to top, black, black),
    radial-gradient(ellipse 22px 26px, green calc(100% - 1px), transparent);

  mask-size: 50% 50%, 100%;
  mask-repeat: no-repeat;
  mask-composite: subtract;

  pointer-events: none;
}

.sq::before {
  right: calc(100% - 1px);
  mask-position: bottom right;
}

.sq::after {
  left: calc(100% - 1px);
  mask-position: bottom left;
}
</style>
