<script setup lang="ts">
const props = defineProps<{
  width: number
  height: number
}>()

const containerElement = useTemplateRef('containerElement')
const containerInnerElement = useTemplateRef('containerInnerElement')

const resizing = ref(false)
const mouseEventDown = ref<MouseEvent>()
const mouseEventDownContainerOffsets = reactive({
  offsetX: 0,
  offsetY: 0,
})

const container = reactive({
  width: props.width,
  height: props.height,
  offsetX: 0,
  offsetY: 0,
})

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  transform: `translate(${container.offsetX}px, ${container.offsetY}px)`,
}))

const handleMouseUp = () => {
  resizing.value = false

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!mouseEventDown.value) return

  const offsetX = -(mouseEventDown.value.clientX - event.clientX)
  const offsetY = -(mouseEventDown.value.clientY - event.clientY)

  container.offsetX = offsetX + mouseEventDownContainerOffsets.offsetX
  container.offsetY = offsetY + mouseEventDownContainerOffsets.offsetY
}

const handleMouseDown = (event: MouseEvent) => {
  resizing.value = true
  mouseEventDown.value = event

  mouseEventDownContainerOffsets.offsetX = container.offsetX
  mouseEventDownContainerOffsets.offsetY = container.offsetY

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
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
          class="left-0 h-full w-3 cursor-w-resize"
          @mousedown="handleMouseDown"
        />
        <div
          class="top-0 w-full h-3 -translate-y-1/2 cursor-n-resize"
          @mousedown="handleMouseDown"
        />
        <div
          class="top-full w-full h-3 -translate-y-1/2 cursor-s-resize"
          @mousedown="handleMouseDown"
        />
        <div
          class="left-full h-full w-3 -translate-x-1/2 cursor-e-resize"
          @mousedown="handleMouseDown"
        />
      </div>
    </div>

    {{ container }}
  </div>
</template>
