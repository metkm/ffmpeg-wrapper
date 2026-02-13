<script setup lang="ts">
const props = defineProps<{
  normalizeBy: number
  minDuration: number
  totalDuration: number
}>()

const modelValueBefore = defineModel<{ start: number, end: number }>('before', { default: { start: 0, end: 0 } })
const modelValueAfter = defineModel<{ start: number, end: number }>('after', { default: { start: 0, end: 0 } })

const handle = useTemplateRef('handle')

const startMouseX = ref(0)

const startBefore = ref({ ...modelValueBefore.value })
const startAfter = ref({ ...modelValueAfter.value })

const handleMove = (event: PointerEvent) => {
  event.stopPropagation()

  if (event.buttons === 0)
    return

  // 0 to 1
  const dx = (event.clientX - startMouseX.value) / props.normalizeBy

  modelValueBefore.value.end = startBefore.value.end + dx
  modelValueAfter.value.start = startAfter.value.start + dx

  if (dx > 0) {
    const dur = (modelValueAfter.value.end - modelValueAfter.value.start) * props.totalDuration

    if (dur < props.minDuration) {
      modelValueAfter.value.start = ((modelValueAfter.value.end * props.totalDuration) - props.minDuration) / props.totalDuration
    }
  } else {
    const dur = (modelValueBefore.value.end - modelValueBefore.value.start) * props.totalDuration

    if (dur < props.minDuration) {
      modelValueBefore.value.end = ((modelValueBefore.value.start * props.totalDuration) + props.minDuration) / props.totalDuration
    }
  }
}

useEventListener(handle, 'pointerdown', (event) => {
  handle.value?.setPointerCapture(event.pointerId)

  event.preventDefault()
  event.stopPropagation()

  startMouseX.value = event.clientX

  startBefore.value = { ...modelValueBefore.value }
  startAfter.value = { ...modelValueAfter.value }

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
