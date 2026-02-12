<script setup lang="ts">
import { motion } from 'motion-v'
import { injectVideoRootContext } from './VideoRoot.vue'

defineProps<{
  assetUrl: string
  path: string
}>()
const videoRootContext = injectVideoRootContext()

const playing = ref(false)
const showVideoState = ref(false)
const cropRatio = ref()

const videoElement = useTemplateRef('videoElement')

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
    videoRootContext.cropEnabled.value = !videoRootContext.cropEnabled.value
  },
  ' ': togglePlay,
})
</script>

<template>
  <div class="flex flex-col gap-4 flex-1 ">
    <LayoutGroup>
      <motion.div
        layout
        class="min-h-0 flex flex-col justify-center gap-2 grow"
        :class="videoRootContext.loaded ? 'animate-fade-in': 'opacity-0'"
      >
        <motion.div
          layout
          class="flex items-center"
        >
          <VideoOptionCrop v-model:ratio="cropRatio" />
        </motion.div>

        <motion.div
          layout
          class="relative h-full max-h-max aspect-ratio mx-auto min-h-0 grow"
        >
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

          <VideoAmbientEffect />

          <video
            ref="videoElement"
            class="rounded-md w-full h-full shadow mx-auto shadow-black transition-opacity"
            crossorigin="anonymous"
            :src="assetUrl"
            @ended="togglePlay"
            @click="togglePlay"
          />

          <VideoCropOverlay
            v-if="videoRootContext.cropEnabled.value"
            :ratio="cropRatio"
            class="z-10"
          />
        </motion.div>
      </motion.div>

      <motion.div
        layout
        class="grid grid-cols-[1fr_10fr_1fr] grid-rows-[auto_1fr] items-center gap-2 w-full"
      >
        <p class="text-primary font-medium col-start-2 text-sm">
          {{ formatSeconds(videoRootContext.video.value.currentTime) }}
        </p>

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
      </motion.div>
    </LayoutGroup>
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
