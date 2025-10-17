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

const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const handleLoad = (event: Event) => {
  const element = videoElement.value ?? event.target as HTMLVideoElement

  videoModel.value.duration = element.duration
  videoModel.value.durationRange = [0, Math.round(element.duration)]

  videoModel.value.crop.width = element.videoWidth
  videoModel.value.crop.height = element.videoHeight
  videoModel.value.currentTime = 0

  videoModel.value.volume = element.volume
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

const handleSeek = () => {
  if (!videoElement.value)
    return

  videoElement.value.currentTime = videoModel.value.currentTime
}

const rangeStart = computed(() => formatSeconds(videoModel.value.durationRange[0]!))
const rangeEnd = computed(() => formatSeconds(videoModel.value.durationRange[1]!))

watch(() => videoModel.value.volume, () => {
  if (!videoElement.value)
    return

  videoElement.value.volume = videoModel.value.volume
})

const volumeIcon = computed(
  () => videoModel.value.volume === 0
    ? 'i-lucide-volume-x'
    : videoModel.value.volume < 0.33
      ? 'i-lucide-volume'
      : videoModel.value.volume < 0.66
        ? 'i-lucide-volume-1'
        : 'i-lucide-volume-2',
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

    <div class="flex flex-col items-center gap-4">
      <div class="relative w-full aspect-video">
        <video
          ref="videoElement"
          :src="src"
          class="rounded-(--ui-radius) shadow shadow-black aspect-video"
          crossorigin="anonymous"
          @loadeddata="handleLoad"
          @timeupdate="handleTimeUpdate"
        />

        <div
          class="absolute inset-0"
          @click="togglePlay"
        />
      </div>

      <div class="grid grid-cols-[1fr_10fr_1fr] grid-rows-[auto_1fr] items-center gap-2 w-full">
        <UButton
          :icon="videoPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
          size="xl"
          class="shadow shadow-black row-start-2 h-full justify-center"
          @click="togglePlay"
        />

        <p class="text-xs col-start-2">
          {{ rangeStart }} - {{ rangeEnd }}
        </p>

        <VideoTimeline
          v-model="videoModel.currentTime"
          v-model:range="videoModel.durationRange"
          :duration="videoModel.duration"
          :src="src"
          class="col-start-2"
          @seek="handleSeek"
        />

        <div class="shrink-1 -mt-1">
          <UIcon
            :name="volumeIcon"
            class="size-4"
          />

          <USlider
            v-model="videoModel.volume"
            :min="0"
            :max="1"
            :step="0.01"
            tooltip
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* for some reason with with more than 8px cause indicator to overflow from container element */

.sq::before,
.sq::after {
    content: "";

    width: 6px;
    height: 16px;
    position: absolute;
    bottom: -2px;
    background-color: inherit;

    /* mask-image:
    linear-gradient(to top, black, black),
    radial-gradient(ellipse 24px 24px, green calc(100% - 1px), transparent); */

    mask-image:
        linear-gradient(to top, black, black),
        radial-gradient(ellipse 3.5px 8px, green calc(100% - 1px), transparent);

    mask-size: 50% 50%, 100%;
    mask-repeat: no-repeat;

    mask-composite: subtract;

    pointer-events: none;
}

.sq::before {
    right: 100%;
    mask-position: bottom right, center;
}

.sq::after {
    left: 100%;
    mask-position: bottom left, center;
}
</style>
