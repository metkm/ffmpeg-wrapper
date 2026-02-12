<script lang="ts">
import { createContext } from 'motion-v'
import type { ShallowRef } from 'vue'
import type { VideoCropOptions, Video, VideoInfo } from '~/types/video'

export interface VideoRootContext {
  videoElement: ShallowRef<HTMLVideoElement | null>
  crop: Ref<VideoCropOptions>
  cropEnabled: Ref<boolean>
  trim: Ref<number[][]>
  video: Ref<Video>
  durationAfterCut: ComputedRef<number>
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
const trim = ref<number[][]>([])

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

  trim.value[0]! = [0, element.duration]

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

const durationAfterCut = computed(() => {
  if (!video.value.duration)
    return 1

  if (trim.value.length < 1)
    return video.value.duration / optionsStore.encoderOptions.speed

  return trim.value.reduce((acc, curr) => {
    return acc + ((curr[1] || 0) - (curr[0] || 0))
  }, 0) / optionsStore.encoderOptions.speed

  // const e = trim.value.end ?? video.value.duration ?? 0
  // const s = trim.value.start ?? 0

  // return (e - s) / optionsStore.encoderOptions.speed
})

provideVideoRootContext({
  videoElement,
  crop,
  cropEnabled,
  trim,
  video,
  onDataLoaded,
  durationAfterCut,
  loaded,
  videoInfo,
})
</script>

<template>
  <slot />
</template>
