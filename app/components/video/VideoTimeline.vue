<script setup lang="ts">
import { useFrames } from '~/hooks/useFrames'
import { useThumb } from '~/hooks/useThumb'

const props = defineProps<{
  duration: number
  src: string
}>()

const emit = defineEmits<{
  seek: []
}>()

const modelValueCurrentTime = defineModel<number>({ default: 0 })
const modelValueRange = defineModel<[number, number]>('range', {
  default: [0, 0],
})

const leftThumb = useTemplateRef('leftThumb')
const leftThumbElement = computed(() => leftThumb.value?.$el as HTMLElement)

const rightThumb = useTemplateRef('rightThumb')
const rightThumbElement = computed(() => rightThumb.value?.$el as HTMLElement)

const containerElement = useTemplateRef('container')
const innerContainerElement = useTemplateRef('innerContainer')

const { width: innerContainerWidth } = useElementBounding(innerContainerElement)

const { offsetX: leftThumbx } = useThumb(leftThumbElement, {
  containerElement,
  onMove: (x) => {
    modelValueCurrentTime.value = x / innerContainerWidth.value * props.duration
    emit('seek')

    modelValueRange.value[0] = modelValueCurrentTime.value

    const diff = rightThumbx.value - x - leftThumbElement.value.clientWidth
    if (diff <= 0)
      return false
  },
})

const { offsetX: rightThumbx, width: rightThumbWidth } = useThumb(rightThumbElement, {
  containerElement,
  initialValue: { x: 1 },
  onMove: (x) => {
    modelValueCurrentTime.value = (x - rightThumbWidth.value) / innerContainerWidth.value * props.duration
    emit('seek')

    modelValueRange.value[1] = modelValueCurrentTime.value

    const diff = x - leftThumbx.value - rightThumbElement.value.clientWidth
    if (diff <= 0)
      return false
  },
})

const { frameUrls } = useFrames(props.src, innerContainerElement)

const seekToTime = (event: PointerEvent) => {
  modelValueCurrentTime.value = clamp(event.offsetX / innerContainerWidth.value * props.duration, 0, props.duration)
  emit('seek')

  event.preventDefault()

  const target = event.target as HTMLElement
  target.setPointerCapture(event.pointerId)
}

useEventListener(innerContainerElement, 'pointermove', (event) => {
  if (event.buttons === 0)
    return

  seekToTime(event)
})

useEventListener(innerContainerElement, 'click', seekToTime)

const indicatorOffset = computed(() => clamp(modelValueCurrentTime.value / props.duration) * innerContainerWidth.value)
</script>

<template>
  <div
    ref="container"
    class="relative w-full h-14 px-5 rounded border border-(--ui-bg-elevated)"
  >
    <TimelineThumb
      ref="leftThumb"
      class="absolute rounded-l z-10"
      :style="{
        left: `${leftThumbx}px`,
      }"
    />

    <TimelineThumb
      ref="rightThumb"
      class="absolute rounded-r z-10"
      :style="{
        left: `${rightThumbx}px`,
      }"
    />

    <div
      ref="innerContainer"
      class="relative h-full bg-elevated overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-black pointer-events-none"
        :style="{
          maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) calc(${leftThumbx}px - 8px), transparent calc(${leftThumbx}px - 8px), transparent calc(${rightThumbx}px - 8px), rgba(0, 0, 0, 0.7) calc(${rightThumbx}px - 8px))`,
        }"
      />

      <div
        class="absolute h-full w-1 bg-white/80 z-50 pointer-events-none select-none -translate-x-1/2"
        :style="{ left: `${indicatorOffset}px` }"
      />

      <div class="flex h-full w-full overflow-hidden pointer-events-none select-none">
        <img
          v-for="img in frameUrls"
          :key="img"
          :src="img"
          class="h-full aspect-square object-cover pointer-events-none select-none"
        >
      </div>
    </div>
  </div>
</template>
