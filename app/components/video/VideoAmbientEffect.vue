<script setup lang="ts">
import { injectVideoRootContext } from './VideoRoot.vue'

const WIDTH = 1920
const HEIGHT = 1080
const PIXELS = 4 * WIDTH * HEIGHT

const videoRootContext = injectVideoRootContext()

const step = ref(0)

const canvas = useTemplateRef('canvas')
const canvasTemp = useTemplateRef('canvasTemp')

const ctx = computed(() => canvas.value?.getContext('2d'))
const ctxTemp = computed(() => canvasTemp.value?.getContext('2d'))

const draw = () => {
  if (!ctx.value || !ctxTemp.value || !videoRootContext.videoElement.value) {
    return
  }

  const oldData = ctxTemp.value.getImageData(0, 0, WIDTH, HEIGHT)

  ctxTemp.value.drawImage(videoRootContext.videoElement.value, 0, 0, WIDTH, HEIGHT)

  const newData = ctxTemp.value.getImageData(0, 0, WIDTH, HEIGHT)

  let pixels = PIXELS

  while (pixels--) {
    oldData.data[pixels] = oldData.data[pixels]! * 0.5 + newData.data[pixels]! * 0.5
  }

  ctx.value.putImageData(oldData, 0, 0)
}

const throttledDraw = useThrottleFn(draw, 200)

const loop = () => {
  throttledDraw()
  step.value = window.requestAnimationFrame(loop)
}

const loopStop = () => {
  window.cancelAnimationFrame(step.value)
}

useEventListener(videoRootContext.videoElement, 'play', loop)
useEventListener(videoRootContext.videoElement, ['seeked', 'loadeddata'], () => setTimeout(draw, 50))
useEventListener(videoRootContext.videoElement, ['pause', 'ended'], loopStop)
</script>

<template>
  <div class="absolute -inset-16 -z-10 opacity-40 blur-2xl">
    <canvas
      ref="canvas"
      :width="WIDTH"
      :height="HEIGHT"
      class="h-80 aspect-video pointer-events-none"
    />

    <canvas
      ref="canvasTemp"
      :width="WIDTH"
      :height="HEIGHT"
      class="hidden"
    />
  </div>
</template>
