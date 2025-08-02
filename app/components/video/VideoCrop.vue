<script setup lang="ts">
const props = defineProps<{
  width: number
  height: number
}>()

type Side = 'w' | 'n' | 'e' | 's' | 'move'

const containerElement = useTemplateRef('containerElement')

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

const containerStyle = computed(() => {
  return {
    width: `${container.width}px`,
    height: `${container.height}px`,
    transform: `translate(${container.offsetX}px, ${container.offsetY}px)`,
  }
})

const handleMouseUp = () => {
  mouseEventDownContainer.offsetX = container.offsetX
  mouseEventDownContainer.offsetY = container.offsetY
  mouseEventDownContainer.width = container.width
  mouseEventDownContainer.height = container.height

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!mouseEventDown.value || !containerElement.value) return

  const offsetXDiff = -(mouseEventDown.value.clientX - event.clientX)
  const offsetYDiff = -(mouseEventDown.value.clientY - event.clientY)

  const offsetXNew = offsetXDiff + mouseEventDownContainer.offsetX
  const offsetYNew = offsetYDiff + mouseEventDownContainer.offsetY

  const offsetXClamped = clamp(
    offsetXNew,
    0,
    containerElement.value.clientWidth - mouseEventDownContainer.width,
  )

  const offsetYClamped = clamp(
    offsetYNew,
    0,
    containerElement.value.clientHeight - mouseEventDownContainer.height,
  )

  if (resizingSide.value === 'move') {
    container.offsetX = offsetXClamped
    container.offsetY = offsetYClamped
  } else if (resizingSide.value === 'w') {
    container.offsetX = offsetXNew
    container.width = mouseEventDownContainer.width - offsetXDiff
  } else if (resizingSide.value === 'e') {
    container.width = clamp(
      mouseEventDownContainer.width + offsetXDiff,
      10,
      containerElement.value.clientWidth - container.offsetX,
    )
  } else if (resizingSide.value === 'n') {
    container.offsetY = offsetYNew
    container.height = mouseEventDownContainer.height - offsetYDiff
  } else if (resizingSide.value === 's') {
    container.height = clamp(
      mouseEventDownContainer.height + offsetYDiff,
      0,
      containerElement.value.clientHeight - container.offsetY,
    )
  }
}

const handleMouseDown = (event: MouseEvent, side: Side) => {
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
        class="absolute bg-elevated/50 *:absolute hover:cursor-move"
        :style="containerStyle"
      >
        <div
          class="absolute inset-1.5"
          @mousedown="(event) => handleMouseDown(event, 'move')"
        />

        <div
          class="left-0 h-full w-1 px-1.5 cursor-w-resize -translate-x-1/2 border"
          @mousedown="(event) => handleMouseDown(event, 'w')"
        />
        <div
          class="top-0 w-full h-1 py-1.5 cursor-n-resize -translate-y-1/2 border"
          @mousedown="(event) => handleMouseDown(event, 'n')"
        />
        <div
          class="top-full w-full h-1 py-1.5 cursor-s-resize -translate-y-1/2 border"
          @mousedown="(event) => handleMouseDown(event, 's')"
        />
        <div
          class="left-full h-full w-1 px-1.5 cursor-e-resize -translate-x-1/2 border"
          @mousedown="(event) => handleMouseDown(event, 'e')"
        />
      </div>
    </div>
  </div>
</template>
