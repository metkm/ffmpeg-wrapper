import type { ShallowRef } from 'vue'

export const useFrames = (src: MaybeRefOrGetter<string>, containerElement: Readonly<ShallowRef<HTMLElement | null>>) => {
  const { height, width } = useElementSize(containerElement)

  const frameUrls = ref<string[]>([])
  const dataLoaded = ref(false)

  const videoElement = document.createElement('video')
  const canvasElement = document.createElement('canvas')
  const canvasContext = canvasElement.getContext('2d')

  videoElement.crossOrigin = 'anonymous'

  const generateFrames = () => {
    frameUrls.value = []
    videoElement.currentTime = 0

    const videoRatio = videoElement.videoWidth / videoElement.videoHeight

    const thumbHeight = height.value
    const thumbWidth = height.value * videoRatio

    canvasElement.width = thumbWidth
    canvasElement.height = thumbHeight

    const frameCount = Math.floor(width.value / thumbWidth) + 1
    const durationInterval = videoElement.duration / frameCount

    const extractFrame = async () => {
      if (frameUrls.value.length === frameCount)
        return

      canvasContext?.drawImage(videoElement, 0, 0, thumbWidth, thumbHeight)
      frameUrls?.value.push(canvasElement.toDataURL())

      videoElement.currentTime += durationInterval
      videoElement.requestVideoFrameCallback(extractFrame)
    }

    videoElement.requestVideoFrameCallback(extractFrame)
  }

  const debouncedGenerateFrames = useDebounceFn(generateFrames, 500)

  videoElement.addEventListener('loadeddata', async () => {
    dataLoaded.value = true

    await nextTick() // sometimes container with is 0 for some reason, so i added this
    generateFrames()
  })

  watchEffect(() => {
    videoElement.src = toValue(src)
  })

  watch([width, height], () => {
    if (!dataLoaded.value)
      return

    debouncedGenerateFrames()
  })

  return {
    frameUrls,
  }
}
