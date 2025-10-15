import type { ShallowRef } from 'vue'

export const useFrames = (src: string, containerElement: Readonly<ShallowRef<HTMLElement | null>>) => {
  const { height, width } = useElementSize(containerElement)
  const frameUrls = ref<string[]>([])

  const videoElement = document.createElement('video')
  const canvasElement = document.createElement('canvas')
  const canvasContext = canvasElement.getContext('2d')

  videoElement.crossOrigin = 'anonymous'
  videoElement.src = src

  const frameCount = computed(() => Math.floor(width.value / height.value) + 1)

  videoElement.addEventListener('loadeddata', () => {
    const videoRatio = videoElement.videoWidth / videoElement.videoHeight

    const thumbHeight = height.value
    const thumbWidth = height.value * videoRatio

    canvasElement.width = thumbWidth
    canvasElement.height = thumbHeight

    const durationInterval = videoElement.duration / frameCount.value

    const extractFrame = async () => {
      if (frameUrls.value.length === frameCount.value)
        return

      canvasContext?.drawImage(videoElement, 0, 0, thumbWidth, thumbHeight)
      frameUrls?.value.push(canvasElement.toDataURL())

      videoElement.currentTime += durationInterval
      videoElement.requestVideoFrameCallback(extractFrame)
    }

    videoElement.requestVideoFrameCallback(extractFrame)
  })

  return {
    frameUrls,
  }
}
