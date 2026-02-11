<script lang="ts">
import { createContext } from 'motion-v'
import type { ShallowRef } from 'vue'
import type { VideoCropOptions, VideoTrimOptions, Video, VideoInfo } from '~/types/video'

export interface VideoRootContext {
  videoElement: ShallowRef<HTMLVideoElement | null>
  crop: Ref<VideoCropOptions>
  cropEnabled: Ref<boolean>
  trim: Ref<VideoTrimOptions>
  video: Ref<Video>
  duration: ComputedRef<number>
  loaded: Ref<boolean>
  videoInfo: Ref<VideoInfo>
  onDataLoaded: () => void
}

export const [injectVideoRootContext, provideVideoRootContext] = createContext<VideoRootContext>('VideoRoot')
</script>

<script setup lang="ts">
const videoElement = shallowRef<HTMLVideoElement | null>(null)

const optionsStore = useOptionsStore()

const videoInfo = ref<VideoInfo>({})
const video = ref<Video>({ currentTime: 0, volume: 1, ratio: 16 / 9 })
const crop = ref<VideoCropOptions>({ top: 0, left: 0 })
const trim = ref<VideoTrimOptions>({ start: 0 })

const loaded = ref(false)
const cropEnabled = ref(false)

const onDataLoaded = () => {
  const element = toValue(videoElement)
  if (!element)
    return

  video.value.duration = element.duration
  video.value.currentTime = 0

  video.value.height = element.videoHeight
  video.value.width = element.videoWidth
  video.value.ratio = element.videoWidth / element.videoHeight

  loaded.value = true
}

const { ignoreUpdates } = watchIgnorable(
  () => video.value.currentTime,
  () => {
    const element = toValue(videoElement)
    if (!element)
      return

    element.currentTime = video.value.currentTime
  },
)

watch(
  () => video.value.volume,
  () => {
    const element = toValue(videoElement)
    if (!element)
      return

    element.volume = video.value.volume
  },
)

const onTimeUpdate = () => {
  const element = toValue(videoElement)
  if (!element)
    return

  ignoreUpdates(() => {
    video.value.currentTime = element.currentTime
  })
}

useEventListener(videoElement, 'timeupdate', onTimeUpdate)
useEventListener(videoElement, 'loadeddata', onDataLoaded)

// sometimes loadeddata event is not firing. So we have to do this.
watch(videoElement, () => {
  if (!videoElement.value)
    return

  if (videoElement.value.readyState === 4) {
    onDataLoaded()
  }
})

const duration = computed(() => {
  const e = trim.value.end ?? video.value.duration ?? 0
  const s = trim.value.start ?? 0

  return (e - s) / optionsStore.encoderOptions.speed
})

provideVideoRootContext({
  videoElement,
  crop,
  cropEnabled,
  trim,
  video,
  onDataLoaded,
  duration,
  loaded,
  videoInfo,
})
</script>

<template>
  <slot />
</template>
