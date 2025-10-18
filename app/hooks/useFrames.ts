export const useFrames = (
  framesContainer: MaybeRefOrGetter<HTMLCanvasElement | null>,
  assetUrl: MaybeRefOrGetter<string>,
) => {
  const videoLoaded = ref(false)

  const { height: framesContainerHeight, width: framesContainerWidth } = useElementSize(framesContainer)

  const videoElement = document.createElement('video')
  videoElement.crossOrigin = 'anonymous'

  const context = computed(() => toValue(framesContainer)?.getContext('2d'))

  const generateFrames = () => {
    videoElement.currentTime = 0

    const ratio = videoElement.videoWidth / videoElement.videoHeight

    const frameHeight = framesContainerHeight.value
    const frameWidth = framesContainerHeight.value * ratio

    const frameCount = Math.floor(framesContainerWidth.value / frameWidth) + 1
    const interval = videoElement.duration / frameCount

    toValue(framesContainer)!.width = frameWidth * frameCount
    toValue(framesContainer)!.height = frameHeight

    let index = 0

    const extractFrame = () => {
      if (index === frameCount)
        return

      if (!context.value)
        return

      context.value.drawImage(videoElement, index * frameWidth, 0, frameWidth, frameHeight)

      videoElement.currentTime += interval

      index++
      videoElement.requestVideoFrameCallback(extractFrame)
    }

    videoElement.requestVideoFrameCallback(extractFrame)
  }

  useEventListener(videoElement, 'loadeddata', () => {
    videoLoaded.value = true
    generateFrames()
  })

  watchPostEffect(() => {
    videoLoaded.value = false
    videoElement.src = toValue(assetUrl)
  })

  watchDebounced([framesContainerWidth, framesContainerHeight], (
    [_w, _h],
    [oldWidth, oldHeight],
  ) => {
    if (!videoLoaded.value)
      return

    if (oldWidth === 0 || oldHeight === 0)
      return

    generateFrames()
  }, {
    debounce: 500,
    immediate: false,
  })
}
