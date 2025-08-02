<script setup lang="ts">
const props = defineProps<{
  width: number
  height: number
}>()

type Side = 'w' | 'n' | 'e' | 's'

const MIN_WIDTH = 20
const MIN_HEIGHT = 20

const containerElement = useTemplateRef('containerElement')
const containerInnerElement = useTemplateRef('containerInnerElement')

const resizing = ref(false)
const resizingSide = ref<Side | undefined>()

const mouseEventDown = ref<MouseEvent>()
const mouseEventDownContainer = reactive({
  offsetX: 0,
  offsetY: 0,
  width: 100,
  height: 100,
})

const container = reactive({
  offsetX: 0,
  offsetY: 0,
  width: 100,
  height: 100,
})

const containerStyle = computed(() => ({
  width: `${container.width}px`,
  height: `${container.height}px`,
  transform: `translate(${container.offsetX}px, ${container.offsetY}px)`,
}))

const handleMouseUp = () => {
  resizing.value = false

  mouseEventDownContainer.offsetX = container.offsetX
  mouseEventDownContainer.offsetY = container.offsetY
  mouseEventDownContainer.width = container.width
  mouseEventDownContainer.height = container.height

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!mouseEventDown.value || !containerElement.value) return

  const offsetX = -(mouseEventDown.value.clientX - event.clientX)
  const offsetY = -(mouseEventDown.value.clientY - event.clientY)

  if (resizingSide.value === 'w') {
    const newOffset = offsetX + mouseEventDownContainer.offsetX
    const newWidth = mouseEventDownContainer.width + (mouseEventDownContainer.offsetX - newOffset)

    if (newWidth <= MIN_WIDTH) {
      return
    }

    container.offsetX = clamp(
      newOffset,
      0,
      containerElement.value.clientWidth,
    )

    container.width = clamp(
      newWidth,
      MIN_WIDTH,
      containerElement.value.clientWidth,
    )
  } else if (resizingSide.value === 'n') {
    const newOffset = offsetY + mouseEventDownContainer.offsetY
    const newHeight = mouseEventDownContainer.height + (mouseEventDownContainer.offsetY - newOffset)

    if (newHeight <= MIN_HEIGHT) {
      return
    }

    container.offsetY = clamp(
      newOffset,
      0,
      containerElement.value.clientHeight,
    )

    container.height = clamp(
      newHeight,
      MIN_HEIGHT,
      containerElement.value.clientHeight,
    )
  } else if (resizingSide.value === 'e') {
    container.width = clamp(
      mouseEventDownContainer.width + offsetX,
      0,
      containerElement.value.clientWidth,
    )
  } else if (resizingSide.value === 's') {
    container.height = clamp(
      mouseEventDownContainer.height + offsetY,
      0,
      containerElement.value.clientHeight,
    )
  }
}

const handleMouseDown = (event: MouseEvent, side: Side) => {
  resizing.value = true
  resizingSide.value = side

  mouseEventDown.value = event

  mouseEventDownContainer.offsetX = container.offsetX
  mouseEventDownContainer.offsetY = container.offsetY
  mouseEventDownContainer.width = container.width
  mouseEventDownContainer.height = container.height

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

onMounted(() => {
  if (!containerElement.value) return

  container.height = containerElement.value.clientHeight
  container.width = containerElement.value.clientWidth
})
</script>

<template>
  <div class="max-w-md mx-auto relative">
    <div class="absolute top-4 left-4 bg-elevated">
      {{ containerStyle }}
    </div>

    <img src="https://pbs.twimg.com/media/GxHAvLWaUAA-gnM?format=jpg&name=large">

    <div
      ref="containerElement"
      class="absolute inset-0"
    >
      <div
        ref="containerInnerElement"
        class="absolute bg-elevated/50 *:absolute *:bg-red-500/50"
        :style="containerStyle"
      >
        <div
          class="left-0 h-full w-3 -translate-x-1/2 cursor-w-resize"
          @mousedown="(event) => handleMouseDown(event, 'w')"
        />
        <div
          class="top-0 w-full h-3 -translate-y-1/2 cursor-n-resize"
          @mousedown="(event) => handleMouseDown(event, 'n')"
        />
        <div
          class="top-full w-full h-3 -translate-y-1/2 cursor-s-resize"
          @mousedown="(event) => handleMouseDown(event, 's')"
        />
        <div
          class="left-full h-full w-3 -translate-x-1/2 cursor-e-resize"
          @mousedown="(event) => handleMouseDown(event, 'e')"
        />
      </div>
    </div>
  </div>
</template>
