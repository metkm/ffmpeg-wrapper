<script setup lang="ts">
import { defaultVideoValues } from '~/constants'
import type { VideoValues } from '~/types/video'

defineProps<{
  url: string
}>()

const emit = defineEmits<{
  close: []
}>()

const videoModel = defineModel<VideoValues>({
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
  videoModel.value.currentTime = videoElement.value?.currentTime || videoModel.value.currentTime
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

watch(
  () => videoModel.value.range,
  (range, oldRange) => {
    if (!videoElement.value) return

    videoElement.value.currentTime = range[0]! !== oldRange[0]! ? oldRange[0]! : oldRange[1]!
  },
)
</script>

<template>
  <section class="space-y-4 rounded-(--ui-radius)">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-x"
        square
        variant="ghost"
        color="neutral"
        @click="emit('close')"
      />

      <p class="font-medium">
        {{ decodeURI(url).split('\\').at(-1) }}
      </p>
    </div>

    <div class="relative flex items-center gap-4">
      <video
        ref="videoElement"
        :src="url"
        class="aspect-video rounded-(--ui-radius) w-full"
        @loadeddata="handleLoad"
        @timeupdate="handleTimeUpdate"
      />

      <div class="p-4 absolute bottom-0 inset-x-0  bg-gradient-to-t from-black">
        <div class="flex items-center gap-4">
          <UButton
            :icon="videoPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
            color="neutral"
            size="sm"
            variant="soft"
            @click="toggle"
          />

          <p>{{ rangeStart }} / {{ rangeEnd }}</p>

          <div class="flex-1 relative">
            <div
              class="absolute w-1.5 h-4 mt-2 bg-primary rounded-full z-10 pointer-events-none"
              :style="{
                left: `${videoModel.currentTime * 100 / videoModel.duration}%`,
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
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
