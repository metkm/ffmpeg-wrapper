<script setup lang="ts">
import { motion } from 'motion-v'
import { injectVideoRootContext } from '../VideoRoot.vue'

const modelValueRatio = defineModel<number>('ratio')

const videoRootContext = injectVideoRootContext()

const aspectRatios = [
  { label: '16 / 9', w: 16, h: 9 },
  { label: '9 / 16', w: 9, h: 16 },
  { label: '1 / 1', w: 1, h: 1 },
]

const aspectRatio = ref<typeof aspectRatios[number]>()

const selectRatio = (ratio: typeof aspectRatios[number]) => {
  aspectRatio.value = ratio
  modelValueRatio.value = ratio.w / ratio.h
}
</script>

<template>
  <motion.div
    layout
    class="flex flex-col gap-2"
  >
    <Motion layout="position">
      <UButton
        :variant="videoRootContext.cropEnabled.value ? 'solid' : 'soft'"
        icon="i-lucide-crop"
        size="sm"
        @click="videoRootContext.cropEnabled.value = !videoRootContext.cropEnabled.value"
      >
        Crop
      </UButton>
    </Motion>

    <AnimatePresence>
      <motion.ul
        v-if="videoRootContext.cropEnabled.value"
        class="flex items-center gap-2"
        layout
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <li
          v-for="ratio in aspectRatios"
          :key="ratio.label"
        >
          <UButton
            :variant="ratio.label === aspectRatio?.label ? 'subtle' : 'ghost'"
            class="min-w-14"
            size="sm"
            block
            @click="selectRatio(ratio)"
          >
            {{ ratio.label }}
          </UButton>
        </li>
      </motion.ul>
    </AnimatePresence>
  </motion.div>
</template>
