<script setup lang="ts">
import type { VideoCropOptions } from '~/types/video'

const props = defineProps<{
  width?: number
  height?: number
}>()

const modelValueCrop = defineModel<VideoCropOptions>({
  default: {
    top: 0,
    left: 0,
  },
})

type Side = 'w' | 'n' | 'e' | 's' | 'move'

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

const handleMouseMove = (e: MouseEvent) => {
  e.preventDefault()

  const dx = (e.clientX - startMouse.x) / containerElementWidth.value
  const dy = (e.clientY - startMouse.y) / containerElementHeight.value

  if (resizingSide.value === 'n') {
    const newY = clamp(startCrop.y + dy, 0, 1)

    crop.height = startCrop.height - (newY - startCrop.y)
    crop.y = newY
  } else if (resizingSide.value === 'e') {
    crop.width = clamp(startCrop.width + dx, 0, 1)
  } else if (resizingSide.value === 's') {
    crop.height = clamp(startCrop.height + dy, 0, 1)
  } else if (resizingSide.value === 'w') {
    const newX = clamp(startCrop.x + dx, 0, 1)

    crop.width = startCrop.width - (newX - startCrop.x)
    crop.x = newX
  } else if (resizingSide.value === 'move') {
    crop.x = clamp(startCrop.x + dx, 0, 1 - crop.width)
    crop.y = clamp(startCrop.y + dy, 0, 1 - crop.height)
  }

  if (props.height) {
    modelValueCrop.value.top = Math.floor(crop.y * props.height)
    modelValueCrop.value.height = Math.floor(crop.height * props.height)
  }

  if (props.width) {
    modelValueCrop.value.left = Math.floor(crop.x * props.width)
    modelValueCrop.value.width = Math.floor(crop.width * props.width)
  }
}

const handleMouseUp = () => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

const handleMouseDown = (e: MouseEvent, side: Side) => {
  resizingSide.value = side
  startMouse.x = e.clientX
  startMouse.y = e.clientY

  Object.assign(startCrop, crop)

  addEventListener('mousemove', handleMouseMove)
  addEventListener('mouseup', handleMouseUp)
}
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
          @mousedown="(event) => handleMouseDown(event, 'move')"
        />

        <div
          class="left-0 h-full w-1 px-1.5 cursor-w-resize -translate-x-1/2"
          @mousedown="(event) => handleMouseDown(event, 'w')"
        />
        <div
          class="top-0 w-full h-1 py-1.5 cursor-n-resize -translate-y-1/2"
          @mousedown="(event) => handleMouseDown(event, 'n')"
        />
        <div
          class="top-full w-full h-1 py-1.5 cursor-s-resize -translate-y-1/2"
          @mousedown="(event) => handleMouseDown(event, 's')"
        />
        <div
          class="left-full h-full w-1 px-1.5 cursor-e-resize -translate-x-1/2"
          @mousedown="(event) => handleMouseDown(event, 'e')"
        />
      </div>
    </div>
  </div>
</template>
