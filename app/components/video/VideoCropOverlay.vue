<script setup lang="ts">
import { injectVideoRootContext } from './VideoRoot.vue'

const props = defineProps<{
  ratio?: number
}>()

type Side = 'w' | 'n' | 'e' | 's' | 'move'

const videoRootContext = injectVideoRootContext()

const containerElement = useTemplateRef('containerElement')
const { width: containerElementWidth, height: containerElementHeight } = useElementSize(containerElement)

const resizingSide = ref<Side | undefined>()

const startMouse = reactive({ x: 0, y: 0 })

const startCrop = reactive({ x: 0, y: 0, width: 0, height: 0 })
const crop = reactive({
  x: 0,
  y: 0,
  width: 1,
  height: 1,
})

const containerStyle = computed(() => {
  if (!containerElement.value)
    return {}

  const w = containerElementWidth.value
  const h = containerElementHeight.value

  return {
    width: `${crop.width * w}px`,
    height: `${crop.height * h}px`,
    transform: `translate(${crop.x * w}px, ${crop.y * h}px)`,
  }
})

const handlePointerMove = (e: PointerEvent) => {
  e.preventDefault()

  const dx = (e.clientX - startMouse.x) / containerElementWidth.value
  const dy = (e.clientY - startMouse.y) / containerElementHeight.value

  const ratio = videoRootContext.video.value.ratio / (props.ratio ?? videoRootContext.video.value.ratio)

  if (resizingSide.value === 'n') {
    const bottomEdgeAnchor = startCrop.y + startCrop.height

    crop.y = clamp(startCrop.y + dy, 0, 1)
    crop.height = startCrop.height - (crop.y - startCrop.y)

    if (props.ratio) {
      crop.width = crop.height / ratio

      if (crop.width + crop.x > 1) {
        crop.width = 1 - crop.x
        crop.height = crop.width * ratio
        crop.y = bottomEdgeAnchor - crop.height
      }
    }
  } else if (resizingSide.value === 'e') {
    crop.width = clamp(startCrop.width + dx, 0, 1 - crop.x)

    if (props.ratio) {
      crop.height = crop.width * ratio

      if (crop.height + crop.y > 1) {
        crop.height = 1 - crop.y
        crop.width = crop.height / ratio
      }
    }
  } else if (resizingSide.value === 's') {
    crop.height = clamp(startCrop.height + dy, 0, 1 - crop.y)

    if (props.ratio) {
      crop.width = crop.height / ratio

      if (crop.width + crop.x > 1) {
        crop.width = 1 - crop.x
        crop.height = crop.width * ratio
      }
    }
  } else if (resizingSide.value === 'w') {
    const rightEdgeAnchor = startCrop.x + startCrop.width

    crop.x = clamp(startCrop.x + dx, 0, 1)
    crop.width = startCrop.width - (crop.x - startCrop.x)

    if (props.ratio) {
      crop.height = crop.width * ratio

      if (crop.height + crop.y > 1) {
        crop.height = 1 - crop.y
        crop.width = crop.height / ratio
        crop.x = rightEdgeAnchor - crop.width
      }
    }
  } else if (resizingSide.value === 'move') {
    crop.x = clamp(startCrop.x + dx, 0, 1 - crop.width)
    crop.y = clamp(startCrop.y + dy, 0, 1 - crop.height)
  }

  const videoHeight = videoRootContext.video.value.height
  const videoWidth = videoRootContext.video.value.width

  if (videoHeight) {
    videoRootContext.crop.value.top = Math.floor(crop.y * videoHeight)
    videoRootContext.crop.value.height = Math.floor(crop.height * videoHeight)
  }

  if (videoWidth) {
    videoRootContext.crop.value.left = Math.floor(crop.x * videoWidth)
    videoRootContext.crop.value.width = Math.floor(crop.width * videoWidth)
  }
}

const handlePointerUp = () => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
}

const handlePointerDown = (e: PointerEvent, side: Side) => {
  e.preventDefault()

  const element = e.currentTarget as HTMLElement
  element.setPointerCapture(e.pointerId)

  resizingSide.value = side
  startMouse.x = e.clientX
  startMouse.y = e.clientY

  Object.assign(startCrop, crop)

  addEventListener('pointermove', handlePointerMove)
  addEventListener('pointerup', handlePointerUp)
}

watch(() => props.ratio, (_ratio) => {
  if (!_ratio)
    return

  const ratio = videoRootContext.video.value.ratio / _ratio
  crop.width = crop.height / ratio

  if (crop.x + crop.width > 1) {
    crop.x = 1 - crop.width
  }
})
</script>

<template>
  <div class="absolute inset-0">
    <slot />

    <div
      ref="containerElement"
      class="relative w-full h-full"
    >
      <div
        ref="containerInnerElement"
        class="absolute bg-elevated/50 *:absolute hover:cursor-move rounded-md border-2 border-dashed border-muted"
        :style="containerStyle"
      >
        <div
          class="absolute inset-1.5"
          @pointerdown="(event) => handlePointerDown(event, 'move')"
        />

        <div
          class="left-0 h-full w-1 px-1.5 cursor-w-resize -translate-x-1/2"
          @pointerdown="(event) => handlePointerDown(event, 'w')"
        />
        <div
          class="top-0 w-full h-1 py-1.5 cursor-n-resize -translate-y-1/2"
          @pointerdown="(event) => handlePointerDown(event, 'n')"
        />
        <div
          class="top-full w-full h-1 py-1.5 cursor-s-resize -translate-y-1/2"
          @pointerdown="(event) => handlePointerDown(event, 's')"
        />
        <div
          class="left-full h-full w-1 px-1.5 cursor-e-resize -translate-x-1/2"
          @pointerdown="(event) => handlePointerDown(event, 'e')"
        />
      </div>
    </div>
  </div>
</template>
