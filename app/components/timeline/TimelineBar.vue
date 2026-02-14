<script setup lang="ts">
import type { ShortcutsConfig } from '@nuxt/ui/runtime/composables/defineShortcuts.js'

const props = defineProps<{
  duration: number
  assetUrl: string
  path: string
}>()

const modelValueCurrentTime = defineModel<number>({ default: 0 })
const modelValueTrim = defineModel<number[][]>('trim', {
  default: [],
})

// start and end values are normalized. from 0 to 1
const segments = ref([
  {
    id: crypto.randomUUID(),
    start: 0,
    end: 1,
    enabled: true,
  },
])

const containerElement = useTemplateRef('container')

const { width: containerWidth } = useElementBounding(containerElement)

const { elementX: mouseX, isOutside } = useMouseInElement(containerElement)

const mouseXNormalized = computed(() => clamp(mouseX.value / containerWidth.value, 0, 1))

const segmentHoveredIndex = computed(
  () => segments.value.findIndex(
    segment => mouseXNormalized.value > segment.start && mouseXNormalized.value < segment.end,
  ),
)

const enabledSegmentCount = computed(() => segments.value.reduce(
  (acc, curr) => acc + (curr.enabled ? 1 : 0),
  0,
))

const cutSegment = () => {
  if (isOutside.value)
    return

  if (segmentHoveredIndex.value === -1) {
    console.log('segment to cut is not found')
    return
  }

  const segment = segments.value[segmentHoveredIndex.value]
  if (!segment)
    return

  segments.value.splice(segmentHoveredIndex.value, 1, {
    id: segment.id,
    start: segment.start,
    end: mouseXNormalized.value,
    enabled: segment.enabled,
  }, {
    id: crypto.randomUUID(),
    start: mouseXNormalized.value,
    end: segment.end,
    enabled: true,
  })
}

const deleteSegment = () => {
  const index = segmentHoveredIndex.value

  if (segments.value.length <= 1 || index === -1)
    return

  const segment = segments.value[index]
  if (!segment || (enabledSegmentCount.value === 1 && segment.enabled))
    return

  const leftSegment = segments.value[index - 1]
  const rightSegment = segments.value[index + 1]

  if (!segment.enabled) {
    if (leftSegment?.enabled) {
      segments.value[index - 1]!.end = segment.end
    } else if (rightSegment?.enabled) {
      segments.value[index + 1]!.start = segment.start
    }
  } else {
    if (leftSegment) {
      segments.value[index - 1]!.end = segment.end
    } else if (rightSegment) {
      segments.value[index + 1]!.start = segment.start
    }
  }

  segments.value.splice(index, 1)
}

const toggleSegment = () => {
  if (segments.value.length <= 1 || segmentHoveredIndex.value === -1)
    return

  const willEnable = !segments.value[segmentHoveredIndex.value]!.enabled
  if (!willEnable && enabledSegmentCount.value === 1)
    return

  segments.value[segmentHoveredIndex.value]!.enabled = willEnable
}

const seekToTime = () => {
  modelValueCurrentTime.value = mouseXNormalized.value * props.duration
}

useEventListener(containerElement, 'click', seekToTime)

useEventListener(containerElement, 'pointerdown', (event) => {
  const el = event.target as HTMLElement
  el.setPointerCapture(event.pointerId)
})

useEventListener(containerElement, 'pointermove', (event) => {
  if (event.buttons === 0)
    return

  event.preventDefault()
  seekToTime()
})

useEventListener(containerElement, 'pointerup', (event) => {
  const el = event.target as HTMLElement
  el.releasePointerCapture(event.pointerId)

  // event.preventDefault()
})

const indicatorOffset = computed(() => clamp(modelValueCurrentTime.value / props.duration) * containerWidth.value)

watch(segments, () => {
  modelValueTrim.value = segments.value
    .filter(segment => segment.enabled)
    .map(segment => [Math.round(segment.start * props.duration), Math.round(segment.end * props.duration)])
}, { deep: true })

const shortcuts = {
  q: {
    action: cutSegment,
    label: 'Cut',
  },
  d: {
    action: deleteSegment,
    label: 'Delete',
  },
  t: {
    action: toggleSegment,
    label: 'Toggle',
  },
}

const extractShortcuts = () => {
  const result: ShortcutsConfig = {}

  for (const [k, v] of Object.entries(shortcuts)) {
    result[k] = v.action
  }

  return result
}

defineShortcuts(extractShortcuts())
</script>

<template>
  <div>
    <div
      ref="container"
      class="relative w-full h-24 rounded-md ring ring-default overflow-hidden bg-default"
    >
      <div
        class="absolute h-full w-0.5 bg-primary shadow shadow-black pointer-events-none select-none -translate-x-1/2 z-50"
        :style="{ left: `${indicatorOffset}px` }"
      />

      <ol class="flex absolute w-full h-full divide-x divide-default z-10">
        <li
          v-for="(segment, index) in segments"
          :key="segment.id"
          class="flex justify-between hover:bg-elevated/50 text-xs relative"
          :style="{
            width: `${(segment.end - segment.start) * containerWidth}px`,
          }"
          :class="{
            'text-default/10': !segment.enabled,
          }"
          :data-enabled="segment.enabled"
        >
          <TimelineBarSegmentMoveable
            v-model="segments[index]"
            v-model:next="segments[index + 1]"
            v-model:prev="segments[index - 1]"
            :normalize-by="containerWidth"
            :total-duration="duration"
            class="w-full h-full"
          >
            <div class="flex flex-col justify-between select-none overflow-hidden">
              <div
                v-if="!segment.enabled"
                class="absolute inset-0 text-default/10 bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-size-[8px_8px]"
              />

              <p class="truncate">
                {{ segment.enabled ? 'Enabled' : 'Disabled' }}
              </p>
              <p class="overflow-hidden">
                {{ Math.floor(segment.start * duration) }}s -  {{ Math.floor(segment.end * duration) }}s
              </p>
            </div>

            <!-- <TimelineBarSegmentResizeHandle
              v-if="index !== segments.length - 1"
              v-model:after="segments[index + 1]"
              v-model:before="segments[index]"
              class="z-20 absolute right-0 inset-y-0"
              :normalize-by="containerWidth"
              :min-duration="2"
              :total-duration="duration"
            /> -->
          </TimelineBarSegmentMoveable>
        </li>
      </ol>

      <TimelineAudioGraph
        :path="path"
        class="h-full w-full mt-auto opacity-55 -z-10 pointer-events-none"
      />
    </div>

    <ol class="flex items-center gap-2">
      <li
        v-for="[k, v] in Object.entries(shortcuts)"
        :key="k"
      >
        <div class="flex items-center gap-1 mt-2">
          <UKbd>{{ k }}</UKbd>

          <p class="text-xs font-medium">
            {{ v.label }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
