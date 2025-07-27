<script setup lang="ts">
defineProps<{
  url: string
}>()

const videoElement = useTemplateRef('videoElement')
const videoPlaying = ref(false)

const video = reactive({
  crf: 26,
  duration: 0,
  range: [0, 1],
  currentTime: 0,
})

const rangeStart = computed(() => formatSeconds(video.range[0]!))
const rangeEnd = computed(() => formatSeconds(video.range[1]!))

const handleLoad = () => {
  if (!videoElement.value) return
  video.duration = videoElement.value.duration
  video.range = [0, videoElement.value.duration]
}

const handleTimeUpdate = () => {
  video.currentTime = videoElement.value?.currentTime || video.currentTime
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
  () => video.range,
  (range, oldRange) => {
    if (!videoElement.value) return

    videoElement.value.currentTime = range[0]! !== oldRange[0]! ? oldRange[0]! : oldRange[1]!
  },
)
</script>

<template>
  <section class="space-y-4 rounded-(--ui-radius)">
    <div class="flex flex-col gap-4 mx-auto max-w-4xl">
      <p class="font-medium">
        {{ decodeURI(url).split('\\').at(-1) }}
      </p>

      <div class="relative flex items-center gap-4">
        <video
          ref="videoElement"
          :src="url"
          class="aspect-video rounded-(--ui-radius)"
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
                  left: `${video.currentTime * 100 / video.duration}%`,
                  transform: 'translateX(-50%)',
                }"
              />

              <USlider
                v-model="video.range"
                color="neutral"
                :min="0"
                :max="video.duration"
                size="xs"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <UFormField
        label="CRF"
        help="How much lossless video should be"
      >
        <UInputNumber
          v-model="video.crf"
          :min="0"
          :max="51"
          variant="soft"
          color="neutral"
        />
      </UFormField>
    </div>
  </section>
</template>
