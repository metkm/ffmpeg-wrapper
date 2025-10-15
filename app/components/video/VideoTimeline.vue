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

// const modelValueCurrentTime = defineModel<number>({ default: 0 })
// const modelValueRange = defineModel<[number, number]>('range', { default: [0, 0] })

// const offsetX = ref(0)

const leftThumb = useTemplateRef('leftThumb')
const leftThumbElement = computed(() => leftThumb.value?.$el as HTMLElement)

const rightThumb = useTemplateRef('rightThumb')
const rightThumbElement = computed(() => rightThumb.value?.$el as HTMLElement)

const containerElement = useTemplateRef('container')

const { offsetX: leftThumbx } = useThumb(leftThumbElement, containerElement)
const { offsetX: rightThumbx } = useThumb(rightThumbElement, containerElement)

// const { frameUrls } = useFrames(props.src, innerContainerElement)

// const { style: leftThumbStyle, x: leftX } = useDraggable(leftThumbElement, {
//   containerElement,
//   preventDefault: true,
//   stopPropagation: true,
//   onEnd: () => {
//     const thumbWidth = leftThumbElement.value.clientWidth
//     const diff = rightX.value - leftX.value - thumbWidth

//     if (diff <= 0) {
//       leftX.value = rightX.value - thumbWidth
//     }

//     if (innerContainerElement.value) {
//       modelValueRange.value[0] = range(0, innerContainerElement.value.clientWidth, 0, props.duration, leftX.value)
//     }
//   },
// })

// const { style: rightThumbStyle, x: rightX } = useDraggable(rightThumbElement, {
//   containerElement,
//   preventDefault: true,
//   stopPropagation: true,
//   onEnd: () => {
//     const thumbWidth = rightThumbElement.value.clientWidth
//     const diff = rightX.value - leftX.value - thumbWidth

//     if (diff <= 0) {
//       rightX.value = leftX.value + thumbWidth
//     }

//     if (innerContainerElement.value) {
//       modelValueRange.value[1] = range(0, innerContainerElement.value.clientWidth, 0, props.duration, rightX.value - thumbWidth)
//     }
//   },
// })

// const { width: windowWidth, height: windowHeight } = useWindowSize()

// const seekToPosition = (event: PointerEvent) => {
//   modelValueCurrentTime.value = range(0, innerContainerElement.value?.clientWidth || 0, 0, props.duration, event.offsetX)
//   emit('seek')

//   event.preventDefault()
//   event.stopPropagation()

//   const target = event.target as HTMLElement
//   target.setPointerCapture(event.pointerId)
// }

// useEventListener(innerContainerElement, 'pointermove', (event) => {
//   if (event.buttons === 0)
//     return

//   seekToPosition(event)
// })

// useEventListener(innerContainerElement, 'click', seekToPosition)

// watch(modelValueCurrentTime, () => {
//   offsetX.value = range(0, props.duration, 0, innerContainerElement.value?.clientWidth || 0, modelValueCurrentTime.value)
// })

// watch([windowWidth, windowHeight], ([width, height], [oldWidth, oldHeight]) => {
//   const widthDiff = width - oldWidth
//   console.log(widthDiff)

//   leftX.value -= widthDiff
//   rightX.value += widthDiff
// })

// onMounted(() => {
//   rightX.value = (innerContainerElement.value?.clientWidth || 0) + rightThumbElement.value.clientWidth
// })
</script>

<template>
  <div
    ref="container"
    class="relative w-full h-14 px-4 rounded"
  >
    <TimelineThumb
      ref="leftThumb"
      class="absolute rounded-l"
      :style="{
        left: `${leftThumbx}px`,
      }"
    />

    <TimelineThumb
      ref="rightThumb"
      class="absolute rounded-r"
      :style="{
        left: `${rightThumbx}px`,
      }"
    />

    <!-- <TimelineThumb
      ref="leftThumb"
      class="z-10 rounded-l"
      :style="leftThumbStyle"
    />

    <TimelineThumb
      ref="rightThumb"
      class=" z-10 rounded-r"
      :style="rightThumbStyle"
    /> -->

    <!-- <div
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
        class="absolute h-full w-0.5 bg-white z-50 pointer-events-none select-none -translate-x-1/2"
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
    </div> -->
  </div>
</template>
