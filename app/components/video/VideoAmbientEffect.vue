<script setup lang="ts">
import { injectVideoRootContext } from './VideoRoot.vue'
import { animate } from 'motion-v'

const WIDTH = 1920
const HEIGHT = 1080

const videoRootContext = injectVideoRootContext()

const loopId = ref<number>()

const canvas = useTemplateRef('canvas')
const canvasTemp = useTemplateRef('canvasTemp')

const ctx = computed(() => canvas.value?.getContext('2d'))
const ctxTemp = computed(() => canvasTemp.value?.getContext('2d', { willReadFrequently: true }))

const draw = () => {
  if (!ctxTemp.value || !ctx.value || !videoRootContext.videoElement.value) {
    return
  }

  const oldFrame = ctxTemp.value.getImageData(0, 0, WIDTH, HEIGHT)
  ctx.value?.putImageData(oldFrame, 0, 0)

  ctxTemp.value.drawImage(videoRootContext.videoElement.value, 0, 0, WIDTH, HEIGHT)

  animate(canvasTemp.value!, { opacity: [0, 1] }, { duration: 5 })
}

const throttledDraw = useThrottleFn(draw, 5_000)

const loop = async () => {
  throttledDraw()
  loopId.value = window.requestAnimationFrame(loop)
}

const loopStop = () => {
  console.log(loopId.value)
  if (!loopId.value)
    return

  window.cancelAnimationFrame(loopId.value)
}

useEventListener(videoRootContext.videoElement, 'play', loop)
useEventListener(videoRootContext.videoElement, 'seeked', throttledDraw)
useEventListener(videoRootContext.videoElement, ['pause', 'ended'], loopStop)

useEventListener(videoRootContext.videoElement, 'loadeddata', async () => {
  await sleep(500)
  draw()
})
</script>

<template>
  <div class="absolute inset-0 -z-10 opacity-40 scale-110 blur-xl pointer-events-none">
    <canvas
      ref="canvas"
      :width="WIDTH"
      :height="HEIGHT"
      class="w-full h-full"
    />

    <canvas
      ref="canvasTemp"
      :width="WIDTH"
      :height="HEIGHT"
      class="w-full h-full absolute inset-0"
    />

    <!-- <canvas
      ref="canvas"
      :width="WIDTH"
      :height="HEIGHT"
      class="h-full w-full aspect-video pointer-events-none"
      :class="{ 'animate-fade-in': showAmbient }"
    />

    <canvas
      ref="canvasTemp"
      :width="WIDTH"
      :height="HEIGHT"
      class="hidden"
    /> -->
  </div>
</template>
