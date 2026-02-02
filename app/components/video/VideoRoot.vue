<script lang="ts">
import { createContext } from 'motion-v'
import type { ShallowRef } from 'vue'
import type { VideoCropOptions, VideoTrimOptions, Video } from '~/types/video'

export interface VideoRootContext {
  videoElement: ShallowRef<HTMLVideoElement | null>
  crop: Ref<VideoCropOptions>
  trim: Ref<VideoTrimOptions>
  video: Ref<Video>
  onDataLoaded: () => void
}

export const [injectVideoRootContext, provideVideoRootContext] = createContext<VideoRootContext>('VideoRoot')
</script>

<script setup lang="ts">
const videoElement = shallowRef<HTMLVideoElement | null>(null)

const video = ref<Video>({ currentTime: 0, volume: 1 })
const crop = ref<VideoCropOptions>({ top: 0, left: 0 })
const trim = ref<VideoTrimOptions>({ start: 0 })

const onDataLoaded = () => {
  const element = toValue(videoElement)
  if (!element)
    return

  video.value.duration = element.duration
  video.value.currentTime = 0

  video.value.height = element.videoHeight
  video.value.width = element.videoWidth
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

provideVideoRootContext({
  videoElement,
  crop,
  trim,
  video,
  onDataLoaded,
})
</script>

<template>
  <slot />
</template>
