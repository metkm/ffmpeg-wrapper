<script setup lang="ts">
import { injectVideoRootContext } from './VideoRoot.vue'

defineProps<{
  assetUrl: string
  path: string
}>()

const showCrop = ref(false)
const playing = ref(false)
const showVideoState = ref(false)

const videoElement = useTemplateRef('videoElement')

const videoRootContext = injectVideoRootContext()

const trimStartFormatted = computed(() => formatSeconds(videoRootContext.trim.value.start))
const trimEndFormatted = computed(() => formatSeconds(videoRootContext.trim.value.end || videoRootContext.video.value.duration || 0))

const volumeIcon = computed(
  () => videoRootContext.video.value.volume === 0
    ? 'i-lucide-volume-x'
    : videoRootContext.video.value.volume < 0.33
      ? 'i-lucide-volume'
      : videoRootContext.video.value.volume < 0.66
        ? 'i-lucide-volume-1'
        : 'i-lucide-volume-2',
)

const togglePlay = async () => {
  if (playing.value) {
    videoElement.value?.pause()
    playing.value = false
  } else {
    videoElement.value?.play()
    playing.value = true
  }

  await nextTick()
  showVideoState.value = true
}

const onAfterEnter = async () => {
  await sleep(250)
  showVideoState.value = false
}

onMounted(() => {
  videoRootContext.videoElement.value = videoElement.value
})

defineShortcuts({
  'c': () => {
    showCrop.value = !showCrop.value
  },
  ' ': togglePlay,
})
</script>

<template>
  <div class="flex flex-col gap-4 h-[calc(100%)]">
    <div class="flex items-center h-[calc(100%-124px-16px)] mx-auto relative">
      <Transition
        enter-active-class="transition-all"
        leave-active-class="transition-all"
        enter-from-class="opacity-0 scale-80"
        leave-to-class="opacity-0 scale-80"
        @after-enter="onAfterEnter"
      >
        <div
          v-show="showVideoState"
          class="flex items-center justify-center absolute inset-0 z-50 pointer-events-none will-change-transform"
        >
          <div class="size-24 p-4 rounded-full bg-default/80">
            <UIcon
              :name="`i-heroicons-${playing ? 'play' : 'pause'}-solid`"
              class="h-full w-full"
            />
          </div>
        </div>
      </Transition>

      <div class="relative aspect-video w-full max-h-full">
        <video
          ref="videoElement"
          :src="assetUrl"
          class="aspect-video h-full rounded-md"
          crossorigin="anonymous"
          @ended="togglePlay"
        />

        <VideoCropOverlay
          v-if="showCrop"
          v-model="videoRootContext.crop.value"
          :width="videoRootContext.video.value.width"
          :height="videoRootContext.video.value.height"
          class="z-10"
        />
      </div>

      <div
        class="absolute inset-0"
        @click="togglePlay"
      />
    </div>

    <div class="grid grid-cols-[1fr_10fr_1fr] grid-rows-[auto_1fr] items-center gap-2 w-full">
      <div class="flex items-center gap-4 justify-between col-start-2 text-sm">
        <p class="text-primary font-medium">
          {{ formatSeconds(videoRootContext.video.value.currentTime) }}
        </p>

        <p>
          {{ trimStartFormatted }} - {{ trimEndFormatted }}
        </p>
      </div>

      <UButton
        :icon="playing ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
        size="xl"
        class="shadow shadow-black h-full justify-center col-start-1"
        @click="togglePlay"
      />

      <TimelineBar
        v-model="videoRootContext.video.value.currentTime"
        v-model:trim="videoRootContext.trim.value"
        :duration="videoRootContext.video.value.duration || 0"
        :asset-url="assetUrl"
        :path="path"
      />

      <div class="-mt-1">
        <UIcon
          :name="volumeIcon"
          class="size-4"
        />

        <USlider
          v-model="videoRootContext.video.value.volume"
          :min="0"
          :max="1"
          :step="0.01"
          :tooltip="{
            delayDuration: 0,
          }"
        />
      </div>
    </div>
  </div>
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
