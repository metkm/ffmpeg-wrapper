<script setup lang="ts">
import { useVideo } from '~/hooks/useVideo'

defineProps<{
  assetUrl: string
}>()

const showCrop = ref(false)
const playing = ref(false)

defineShortcuts({
  c: () => {
    showCrop.value = !showCrop.value
  },
})

const videoElement = useTemplateRef('videoElement')
const { video, trim, crop } = useVideo(videoElement)

const togglePlay = () => {
  if (playing.value) {
    videoElement.value?.pause()
    playing.value = false
  } else {
    videoElement.value?.play()
    playing.value = true
  }
}

const trimStartFormatted = computed(() => formatSeconds(trim.value.start))
const trimEndFormatted = computed(() => formatSeconds(trim.value.end || video.value.duration || 0))

const volumeIcon = computed(
  () => video.value.volume === 0
    ? 'i-lucide-volume-x'
    : video.value.volume < 0.33
      ? 'i-lucide-volume'
      : video.value.volume < 0.66
        ? 'i-lucide-volume-1'
        : 'i-lucide-volume-2',
)
</script>

<template>
  <section class="flex flex-col items-center gap-4">
    <div class="relative w-full aspect-video">
      <video
        ref="videoElement"
        :src="assetUrl"
        class="rounded-(--ui-radius) shadow shadow-black aspect-video"
        crossorigin="anonymous"
      />

      <div
        class="absolute inset-0"
        @click="togglePlay"
      />

      <VideoCropOverlay
        v-if="showCrop"
        v-model="crop"
        :width="video.width"
        :height="video.height"
        class="z-10"
      />
    </div>

    <div class="grid grid-cols-[1fr_10fr_1fr] grid-rows-[auto_1fr] items-center gap-2 w-full">
      <UButton
        :icon="playing ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
        size="xl"
        class="shadow shadow-black row-start-2 h-full justify-center"
        @click="togglePlay"
      />

      <p class="text-xs col-start-2">
        {{ trimStartFormatted }} - {{ trimEndFormatted }}
      </p>

      <TimelineBar
        v-if="video.duration"
        v-model="video.currentTime"
        v-model:trim="trim"
        :duration="video.duration"
        :asset-url="assetUrl"
        class="col-start-2"
      />

      <div class="shrink-1 -mt-1">
        <UIcon
          :name="volumeIcon"
          class="size-4"
        />

        <USlider
          v-model="video.volume"
          :min="0"
          :max="1"
          :step="0.01"
          :tooltip="{
            delayDuration: 0,
          }"
        />
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
