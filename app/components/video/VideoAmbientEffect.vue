<script setup lang="ts">
import { injectVideoRootContext } from './VideoRoot.vue'

const videoRootContext = injectVideoRootContext()

const canvas = useTemplateRef('canvas')

const step = ref(0)

const draw = () => {
  const ctx = canvas.value?.getContext('2d')

  if (!videoRootContext.videoElement.value || !canvas.value || !ctx) {
    return
  }

  console.log(videoRootContext.videoElement.value?.readyState)
  ctx.drawImage(videoRootContext.videoElement.value, 0, 0, canvas.value.width, canvas.value.height)
}

const loop = () => {
  draw()
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
      width="10"
      height="6"
      class="w-full h-full aspect-video pointer-events-none"
    />
  </div>
</template>
