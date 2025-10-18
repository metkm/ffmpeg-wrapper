import type { Video } from '~/types/video'

export interface VideoCropOptions {
  top: number
  left: number
  width?: number
  height?: number
}

export interface VideoTrimOptions {
  start: number
  end?: number
}

export const useVideo = (target: MaybeRefOrGetter<HTMLVideoElement | null>) => {
  const videoElement = useState<HTMLVideoElement | null>('videoElement', () => null)
  const video = useState<Video>('video', () => ({ currentTime: 0, volume: 1 }))
  const trim = useState<VideoTrimOptions>('trim', () => ({ start: 0 }))
  const crop = useState<VideoCropOptions>('crop', () => ({ top: 0, left: 0 }))

  const onDataLoaded = () => {
    const element = toValue(target)
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
      const element = toValue(target)
      if (!element)
        return

      element.currentTime = video.value.currentTime
    },
  )

  watch(
    () => video.value.volume,
    () => {
      const element = toValue(target)
      if (!element)
        return

      element.volume = video.value.volume
    },
  )

  const onTimeUpdate = () => {
    const element = toValue(target)
    if (!element)
      return

    ignoreUpdates(() => {
      video.value.currentTime = element.currentTime
    })
  }

  useEventListener(target, 'timeupdate', onTimeUpdate)
  useEventListener(target, 'loadeddata', onDataLoaded)

  watchEffect(() => {
    videoElement.value = toValue(target)
  })

  return {
    video,
    trim,
    crop,
  }
}
