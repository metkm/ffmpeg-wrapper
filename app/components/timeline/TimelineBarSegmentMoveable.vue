<script setup lang="ts">
const props = defineProps<{
  normalizeBy: number
  totalDuration: number
  resizable?: boolean
}>()

const modelValueSegment = defineModel<{ start: number, end: number }>({
  default: { start: 0, end: 0 },
})
const modelValueSegmentPrev = defineModel<{ start: number, end: number }>('prev')
const modelValueSegmentNext = defineModel<{ start: number, end: number }>('next')

const ctrlState = useKeyModifier('Control')

const container = useTemplateRef('container')
const handle = useTemplateRef('handle')

const mode = ref<'resizing' | 'moving'>('resizing')
const pointerDownX = ref(0)

const initialSegment = ref({ ...modelValueSegment.value })
const initialSegmentPrev = ref({ ...modelValueSegmentPrev.value })
const initialSegmentNext = ref({ ...modelValueSegmentNext.value })

const segmentPrevEndMin = computed(() => ((initialSegmentPrev.value.start ?? 1) * props.totalDuration + 2) / props.totalDuration)
const segmentNextStartMin = computed(() => ((initialSegmentNext.value.end ?? 1) * props.totalDuration - 2) / props.totalDuration)

const initialSegmentDuration = computed(() => initialSegment.value.end - initialSegment.value.start)

const handleMove = (event: PointerEvent) => {
  event.stopPropagation()

  if (event.buttons === 0)
    return

  const dx = (event.clientX - pointerDownX.value) / props.normalizeBy

  const segmentStartNew = initialSegment.value.start + dx
  const segmentEndNew = initialSegment.value.end + dx

  // drag instead
  if (mode.value === 'moving' && modelValueSegmentNext.value && modelValueSegmentPrev.value) {
    modelValueSegment.value.start = clamp(
      segmentStartNew,
      segmentPrevEndMin.value,
      segmentNextStartMin.value - initialSegmentDuration.value,
    )

    modelValueSegment.value.end = clamp(
      segmentEndNew,
      segmentPrevEndMin.value + initialSegmentDuration.value,
      segmentNextStartMin.value,
    )

    modelValueSegmentPrev.value.end = clamp(
      segmentStartNew,
      segmentPrevEndMin.value,
      modelValueSegment.value.start,
    )

    modelValueSegmentNext.value.start = clamp(
      segmentEndNew,
      modelValueSegment.value.start + initialSegmentDuration.value,
      segmentNextStartMin.value,
    )

    // modelValueSegmentNext.value.start = clamp(
    //   segmentEndNew,
    //   modelValueSegment.value.start + initialSegmentDuration.value,
    //   segmentNextStartMin.value,
    // )
  } else if (mode.value === 'resizing') {
    const min = (initialSegment.value.start * props.totalDuration + 2) / props.totalDuration
    const max = (initialSegmentNext.value.end! * props.totalDuration - 2) / props.totalDuration

    modelValueSegment.value.end = clamp(
      segmentEndNew,
      min,
      max,
    )

    modelValueSegmentNext.value!.start = clamp(
      segmentEndNew,
      min,
      max,
    )
  }
}

const handlePointerUp = (event: PointerEvent) => {
  container.value?.releasePointerCapture(event.pointerId)
  container.value?.removeEventListener('pointermove', handleMove)
}

const handlePointerDown = (event: PointerEvent) => {
  const element = event.target as HTMLElement
  if (
    (!ctrlState.value && mode.value === 'moving')
    || (mode.value === 'moving' && (!modelValueSegmentNext.value || !modelValueSegmentPrev.value))
  ) {
    return
  }

  element.setPointerCapture(event.pointerId)

  event.stopPropagation()
  event.preventDefault()

  pointerDownX.value = event.clientX

  initialSegment.value = { ...modelValueSegment.value }
  initialSegmentPrev.value = { ...modelValueSegmentPrev.value }
  initialSegmentNext.value = { ...modelValueSegmentNext.value }

  element.addEventListener('pointermove', handleMove)
}

useEventListener(handle, 'pointerdown', event => [
  mode.value = 'resizing',
  handlePointerDown(event),
])

useEventListener(container, 'pointerdown', (event) => {
  mode.value = 'moving'
  handlePointerDown(event)
})

useEventListener(container, 'pointerup', handlePointerUp)
useEventListener(handle, 'pointerup', handlePointerUp)

useEventListener(container, 'click', event => event.stopPropagation())
useEventListener(handle, 'click', event => event.stopPropagation())
</script>

<template>
  <div
    ref="container"
    :class="{ 'cursor-move': ctrlState }"
    class="flex w-full h-full"
  >
    <slot />

    <div
      v-if="resizable"
      ref="handle"
      class="h-full absolute right-0 inset-y-0 w-2 cursor-ew-resize translate-x-1/2"
    />
  </div>
</template>
