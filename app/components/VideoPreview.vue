<script setup lang="ts">
import { defaultVideoValues } from '~/constants'
import type { Video } from '~/types/video'

defineProps<{
  url: string
}>()

const emit = defineEmits<{
  close: []
}>()

const videoModel = defineModel<Video>({
  default: defaultVideoValues,
})

const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const rangeStart = computed(() => formatSeconds(videoModel.value.range[0]!))
const rangeEnd = computed(() => formatSeconds(videoModel.value.range[1]!))

const handleLoad = () => {
  if (!videoElement.value) return
  videoModel.value.duration = videoElement.value.duration
  videoModel.value.range = [0, videoElement.value.duration]
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

    videoElement.value.currentTime = range[0]! !== oldRange[0]! ? range[0]! : oldRange[1]!
  },
)
</script>

<template>
  <section class="space-y-4 rounded-(--ui-radius)">
    <div class="relative flex items-center gap-4">
      <video
        ref="videoElement"
        :src="url"
        class="aspect-video rounded-(--ui-radius) w-full"
        @loadeddata="handleLoad"
        @timeupdate="handleTimeUpdate"
      />

      <div class="p-4 absolute bottom-0 inset-x-0  bg-gradient-to-t from-black/50">
        <div class="flex items-center gap-2 rounded-full">
          <UButton
            :icon="videoPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
            color="neutral"
            size="sm"
            variant="ghost"
            :ui="{ leadingIcon: 'drop-shadow-lg shadow-black' }"
            @click="toggle"
          />

          <p class="text-sm font-medium text-white mr-2 text-shadow-lg">
            {{ rangeStart }} / {{ rangeEnd }}
          </p>

          <div class="flex-1 relative">
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
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UButton
        icon="i-lucide-x"
        square
        variant="ghost"
        color="neutral"
        @click="emit('close')"
      />

      <p class="font-medium truncate text-muted">
        {{ decodeURI(url).split('\\').at(-1) }}
      </p>
    </div>
  </section>
</template>
