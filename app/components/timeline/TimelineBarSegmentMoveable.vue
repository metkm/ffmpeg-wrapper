<script setup lang="ts">
const props = defineProps<{
  normalizeBy: number
  totalDuration: number
}>()

const modelValueSegment = defineModel<{ start: number, end: number }>({ default: { start: 0, end: 0 } })
const modelValueSegmentPrev = defineModel<{ start: number, end: number }>('prev', { default: { start: 0, end: 0 } })
const modelValueSegmentNext = defineModel<{ start: number, end: number }>('next', { default: { start: 0, end: 0 } })

const ctrlState = useKeyModifier('Control')
const container = useTemplateRef('container')

const pointerDownX = ref(0)

const initialSegment = ref({ ...modelValueSegment.value })
const initialSegmentPrev = ref({ ...modelValueSegmentPrev.value })
const initialSegmentNext = ref({ ...modelValueSegmentNext.value })

const prevSegmentEndMin = computed(() => (initialSegmentPrev.value.start * props.totalDuration + 2) / props.totalDuration)
const nextSegmentStartMin = computed(() => (initialSegmentNext.value.end * props.totalDuration - 2) / props.totalDuration)

const initialSegmentDuration = computed(() => initialSegment.value.end - initialSegment.value.start)

const handleMove = (event: PointerEvent) => {
  event.stopPropagation()

  if (event.buttons === 0)
    return

  const dx = (event.clientX - pointerDownX.value) / props.normalizeBy

  const newSegmentStart = initialSegment.value.start + dx
  const newSegmentEnd = initialSegment.value.end + dx

  // drag instead
  if (ctrlState.value) {
    modelValueSegment.value.start = clamp(
      newSegmentStart,
      prevSegmentEndMin.value,
      nextSegmentStartMin.value - initialSegmentDuration.value,
    )

    modelValueSegment.value.end = clamp(
      newSegmentEnd,
      prevSegmentEndMin.value + initialSegmentDuration.value,
      nextSegmentStartMin.value,
    )

    modelValueSegmentPrev.value.end = clamp(
      initialSegmentPrev.value.end + dx,
      prevSegmentEndMin.value,
      modelValueSegment.value.start,
    )

    modelValueSegmentNext.value.start = clamp(
      initialSegmentNext.value.start + dx,
      modelValueSegment.value.start + initialSegmentDuration.value,
      nextSegmentStartMin.value,
    )
  }
}

useEventListener(container, 'pointerdown', (event) => {
  if (!ctrlState.value)
    return

  container.value?.setPointerCapture(event.pointerId)

  event.stopPropagation()
  event.preventDefault()

  pointerDownX.value = event.clientX
  initialSegment.value = { ...modelValueSegment.value }
  initialSegmentPrev.value = { ...modelValueSegmentPrev.value }
  initialSegmentNext.value = { ...modelValueSegmentNext.value }

  container.value?.addEventListener('pointermove', handleMove)
})

useEventListener(container, 'pointerup', (event) => {
  container.value?.releasePointerCapture(event.pointerId)
  container.value?.removeEventListener('pointermove', handleMove)
})

useEventListener(container, 'click', event => event.stopPropagation())
</script>

<template>
  <div
    ref="container"
    :class="{ 'cursor-move': ctrlState }"
    class="w-full h-full"
  >
    <slot />
  </div>
</template>
