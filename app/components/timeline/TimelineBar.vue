<script setup lang="ts">
import { useFrames } from '~/hooks/useFrames'
import { useThumb } from '~/hooks/useThumb'
import type { VideoTrimOptions } from '~/hooks/useVideo'

const props = defineProps<{
  duration: number
  assetUrl: string
  path: string
}>()

const emit = defineEmits<{
  seek: []
}>()

const modelValueCurrentTime = defineModel<number>({ default: 0 })
const modelValueTrim = defineModel<VideoTrimOptions>('trim', {
  default: [0, 0],
})

const leftThumb = useTemplateRef('leftThumb')
const leftThumbElement = computed(() => leftThumb.value?.$el as HTMLElement)

const rightThumb = useTemplateRef('rightThumb')
const rightThumbElement = computed(() => rightThumb.value?.$el as HTMLElement)

const containerElement = useTemplateRef('container')
const innerContainerElement = useTemplateRef('innerContainer')
const frameCanvasElement = useTemplateRef('frameCanvas')

const { width: innerContainerWidth } = useElementBounding(innerContainerElement)

const { offsetX: leftThumbx } = useThumb(leftThumbElement, {
  containerElement,
  onMove: (x) => {
    modelValueCurrentTime.value = x / innerContainerWidth.value * props.duration
    emit('seek')

    modelValueTrim.value.start = modelValueCurrentTime.value

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

    modelValueTrim.value.end = modelValueCurrentTime.value

    const diff = x - leftThumbx.value - rightThumbElement.value.clientWidth
    if (diff <= 0)
      return false
  },
})

useFrames(frameCanvasElement, () => props.assetUrl)

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
    class="relative w-full h-24 px-5 rounded border border-(--ui-bg-elevated)"
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
      class="relative h-full w-full bg-elevated"
    >
      <div class="absolute w-full h-full pointer-events-none">
        <canvas
          ref="frameCanvas"
          class="h-14 w-full"
        />

        <TimelineAudioGraph
          :path="path"
          class="h-10 w-full"
        />
      </div>

      <div
        class="absolute inset-0 bg-black pointer-events-none"
        :style="{
          maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) calc(${leftThumbx}px - 8px), transparent calc(${leftThumbx}px - 8px), transparent calc(${rightThumbx}px - 8px), rgba(0, 0, 0, 0.7) calc(${rightThumbx}px - 8px))`,
        }"
      />

      <div
        class="absolute h-full w-0.5 bg-white z-50 pointer-events-none select-none -translate-x-1/2"
        :style="{ left: `${indicatorOffset}px` }"
      >
        <!-- <div class="h-full flex justify-center items-end">
          <p class="translate-y-6 text-xs text-inverted bg-inverted px-2 py-0.5 rounded-full">
            {{ formatSeconds(modelValueCurrentTime) }}
          </p>
        </div> -->
      </div>
    </div>
  </div>
</template>
