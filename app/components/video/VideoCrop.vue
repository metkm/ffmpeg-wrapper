<script setup lang="ts">
const props = defineProps<{
  width?: number
  height?: number
}>()

const modelValueCrop = defineModel<{
  top: number
  left: number
  width: number
  height: number
}>({
  default: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
})

const MIN_HEIGHT = 20
const MIN_WIDTH = 20

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
  event.preventDefault()
  if (!mouseEventDown.value || !containerElement.value) return

  const offsetXDiff = -(mouseEventDown.value.clientX - event.clientX)
  const offsetYDiff = -(mouseEventDown.value.clientY - event.clientY)

  const offsetXNew = offsetXDiff + mouseEventDownContainer.offsetX
  const offsetYNew = offsetYDiff + mouseEventDownContainer.offsetY

  if (resizingSide.value === 'move') {
    container.offsetX = clamp(
      offsetXNew,
      0,
      containerElement.value.clientWidth - mouseEventDownContainer.width,
    )
    container.offsetY = clamp(
      offsetYNew,
      0,
      containerElement.value.clientHeight - mouseEventDownContainer.height,
    )
  } else if (resizingSide.value === 'w') {
    const newWidth = mouseEventDownContainer.width - offsetXDiff

    const rightSideOfCropWidth = containerElement.value.clientWidth - offsetXNew - newWidth
    const leftSideOfCropWidth = containerElement.value.clientWidth - rightSideOfCropWidth

    container.offsetX = clamp(
      offsetXNew,
      0,
      leftSideOfCropWidth - 20,
    )

    if (container.offsetX <= 0) {
      return
    }

    container.width = clamp(newWidth, 20, containerElement.value.clientWidth)
  } else if (resizingSide.value === 'e') {
    container.width = clamp(
      mouseEventDownContainer.width + offsetXDiff,
      MIN_WIDTH,
      containerElement.value.clientWidth - container.offsetX,
    )
  } else if (resizingSide.value === 'n') {
    const newHeight = mouseEventDownContainer.height - offsetYDiff

    const bottomSideOfCropWidth = containerElement.value.clientHeight - offsetYNew - newHeight
    const topSideOfCropWidth = containerElement.value.clientHeight - bottomSideOfCropWidth

    container.offsetY = clamp(
      offsetYNew,
      0,
      topSideOfCropWidth - 20,
    )

    if (container.offsetY <= 0) {
      return
    }

    container.height = clamp(newHeight, 20, containerElement.value.clientHeight)
  } else if (resizingSide.value === 's') {
    container.height = clamp(
      mouseEventDownContainer.height + offsetYDiff,
      MIN_HEIGHT,
      containerElement.value.clientHeight - container.offsetY,
    )
  }
}

const handleMouseDown = (event: MouseEvent, side: Side) => {
  event.preventDefault()
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

watch(container, () => {
  if (!containerElement.value) return

  if (props.height) {
    modelValueCrop.value.top = Math.floor(range(0, containerElement.value.clientHeight, 0, props.height, container.offsetY))
    modelValueCrop.value.height = Math.floor(range(0, containerElement.value.clientHeight, 0, props.height, container.height))
  }

  if (props.width) {
    modelValueCrop.value.left = Math.floor(range(0, containerElement.value.clientWidth, 0, props.width, container.offsetX))
    modelValueCrop.value.width = Math.floor(range(0, containerElement.value.clientWidth, 0, props.width, container.width))
  }
}, {
  immediate: true,
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
        class="absolute bg-elevated/50 *:absolute hover:cursor-move border-2 border-dashed border-muted"
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
