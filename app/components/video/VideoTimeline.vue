<script setup lang="ts">
import { useFrames } from '~/hooks/useFrames'

const props = defineProps<{
  duration: number
  src: string
}>()

const emit = defineEmits<{
  seek: []
}>()

const modelValueCurrentTime = defineModel<number>({ default: 0 })

const offsetX = ref(0)

const leftThumb = useTemplateRef('leftThumb')
const rightThumb = useTemplateRef('rightThumb')

const containerElement = useTemplateRef('container')
const innerContainerElement = useTemplateRef('innerContainer')

const leftThumbElement = computed(() => leftThumb.value?.$el as HTMLElement)
const rightThumbElement = computed(() => rightThumb.value?.$el as HTMLElement)

const { frameUrls } = useFrames(props.src, innerContainerElement)

const { style: leftThumbStyle, x: leftX } = useDraggable(leftThumbElement, {
  containerElement,
  preventDefault: true,
  stopPropagation: true,
})

const { style: rightThumbStyle, x: rightX } = useDraggable(rightThumbElement, {
  containerElement,
  preventDefault: true,
  stopPropagation: true,
})

const seekToPosition = (event: PointerEvent) => {
  modelValueCurrentTime.value = range(0, innerContainerElement.value?.clientWidth || 0, 0, props.duration, event.offsetX)
  emit('seek')

  event.preventDefault()
  event.stopPropagation()

  const target = event.target as HTMLElement
  target.setPointerCapture(event.pointerId)
}

useEventListener(innerContainerElement, 'pointermove', (event) => {
  if (event.buttons === 0)
    return

  seekToPosition(event)
})

useEventListener(innerContainerElement, 'click', seekToPosition)

watch(modelValueCurrentTime, () => {
  offsetX.value = range(0, props.duration, 0, innerContainerElement.value?.clientWidth || 0, modelValueCurrentTime.value)
})

onMounted(() => {
  rightX.value = (innerContainerElement.value?.clientWidth || 0) + rightThumbElement.value.clientWidth
})
</script>

<template>
  <div
    ref="container"
    class="relative w-full h-14 px-4 rounded"
  >
    <TimelineThumb
      ref="leftThumb"
      class="z-10 rounded-l"
      :style="leftThumbStyle"
    />

    <TimelineThumb
      ref="rightThumb"
      class=" z-10 rounded-r"
      :style="rightThumbStyle"
    />

    <div
      ref="innerContainer"
      class="relative h-full bg-elevated rounded overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-black pointer-events-none"
        :style="{
          maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) calc(${leftX}px - 8px), transparent calc(${leftX}px - 8px), transparent calc(${rightX}px - 8px), rgba(0, 0, 0, 0.7) calc(${rightX}px - 8px))`,
        }"
      />

      <div
        class="absolute h-full w-1.5 bg-white z-50 pointer-events-none select-none -translate-x-1/2"
        :style="{ left: `${offsetX}px` }"
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
