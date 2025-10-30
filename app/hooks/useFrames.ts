import { invoke } from '@tauri-apps/api/core'

export const useFrames = (
  framesContainer: MaybeRefOrGetter<HTMLCanvasElement | null>,
  path: MaybeRefOrGetter<string>,
  duration: MaybeRefOrGetter<number>,
) => {
  const { height: framesContainerHeight, width: framesContainerWidth } = useElementSize(framesContainer)
  const framesLoading = ref(false)

  const generateFrames = async () => {
    const ratio = 16 / 9

    const frameHeight = Math.floor(framesContainerHeight.value)
    const frameWidth = Math.floor(framesContainerHeight.value * ratio)

    const frameCount = Math.floor(framesContainerWidth.value / frameWidth) + 1
    const interval = toValue(duration) / frameCount

    const container = toValue(framesContainer)
    if (!container)
      return

    container.width = frameWidth * frameCount
    container.height = frameHeight

    framesLoading.value = true

    await Promise.all(
      Array
        .from({ length: frameCount }, (_, index) => index)
        .map(async (index) => {
          const frameBuffer = await invoke<number[]>('get_frame', {
            videoPath: toValue(path),
            time: formatSeconds(index * interval),
            resolution: `${frameWidth}x${frameHeight}`,
          })

          const blob = new Blob([new Uint8Array(frameBuffer)], { type: 'image/webp' })
          const url = URL.createObjectURL(blob)

          const image = new Image()
          image.src = url
          image.onload = () => {
            const context = container.getContext('2d')
            if (!context)
              return

            context.drawImage(image, index * frameWidth, 0, frameWidth, frameHeight)
          }
        }),
    )

    framesLoading.value = false
  }

  watchDebounced([
    () => toValue(duration),
    framesContainerWidth,
    framesContainerHeight,
  ], ([duration, width, height]) => {
    if (duration == 0 || width === 0 || height === 0)
      return

    generateFrames()
  }, {
    debounce: 500,
    immediate: false,
  })

  return {
    framesLoading,
  }

  // const videoLoaded = ref(false)

  // const { height: framesContainerHeight, width: framesContainerWidth } = useElementSize(framesContainer)

  // const videoElement = document.createElement('video')
  // videoElement.crossOrigin = 'anonymous'

  // const context = computed(() => toValue(framesContainer)?.getContext('2d'))

  // const generateFrames = () => {
  //   videoElement.currentTime = 0

  //   const ratio = videoElement.videoWidth / videoElement.videoHeight

  //   const frameHeight = framesContainerHeight.value
  //   const frameWidth = framesContainerHeight.value * ratio

  //   const frameCount = Math.floor(framesContainerWidth.value / frameWidth) + 1
  //   const interval = videoElement.duration / frameCount

  //   const container = toValue(framesContainer)
  //   if (!container)
  //     return

  //   container.width = frameWidth * frameCount
  //   container.height = frameHeight

  //   let index = 0

  //   const extractFrame = () => {
  //     if (index === frameCount)
  //       return

  //     if (!context.value)
  //       return

  //     context.value.drawImage(videoElement, index * frameWidth, 0, frameWidth, frameHeight)

  //     videoElement.currentTime += interval

  //     index++
  //     videoElement.requestVideoFrameCallback(extractFrame)
  //   }

  //   videoElement.requestVideoFrameCallback(extractFrame)
  // }

  // useEventListener(videoElement, 'loadeddata', () => {
  //   videoLoaded.value = true
  //   generateFrames()
  // })

  // watchPostEffect(() => {
  //   videoLoaded.value = false
  //   videoElement.src = toValue(assetUrl)
  // })

  // watchDebounced([framesContainerWidth, framesContainerHeight], (
  //   [_w, _h],
  //   [oldWidth, oldHeight],
  // ) => {
  //   if (!videoLoaded.value)
  //     return

  //   if (oldWidth === 0 || oldHeight === 0)
  //     return

  //   generateFrames()
  // }, {
  //   debounce: 500,
  //   immediate: false,
  // })
}
