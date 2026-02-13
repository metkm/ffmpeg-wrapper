<script setup lang="ts">
const props = defineProps<{
  normalizeBy: number
}>()

const modelValueStart = defineModel<number>('start', { default: 0 })
const modelValueEnd = defineModel<number>('end', { default: 0 })

const handle = useTemplateRef('handle')

const startMouseX = ref(0)

const startStart = ref(modelValueStart.value)
const startEnd = ref(modelValueEnd.value)

const handleMove = (event: PointerEvent) => {
  event.stopPropagation()

  if (event.buttons === 0)
    return

  const dx = (event.clientX - startMouseX.value) / props.normalizeBy

  modelValueEnd.value = startEnd.value + dx
  modelValueStart.value = startStart.value + dx
}

useEventListener(handle, 'pointerdown', (event) => {
  handle.value?.setPointerCapture(event.pointerId)

  event.preventDefault()
  event.stopPropagation()

  startMouseX.value = event.clientX

  startStart.value = modelValueStart.value
  startEnd.value = modelValueEnd.value

  handle.value?.addEventListener('pointermove', handleMove)
})

useEventListener(handle, 'pointerup', (event) => {
  handle.value?.releasePointerCapture(event.pointerId)
  handle.value?.removeEventListener('pointermove', handleMove)
})

useEventListener(handle, 'click', event => event.stopPropagation())
</script>

<template>
  <div
    ref="handle"
    class="h-full w-2 cursor-ew-resize translate-x-1/2"
  />
</template>
