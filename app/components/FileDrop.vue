<script setup lang="ts">
import type { UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { open } from '@tauri-apps/plugin-dialog'
import { motion } from 'motion-v'
import { videoFilters } from '~/constants'

const emit = defineEmits<{
  drop: []
}>()

const path = defineModel<string>()

const hovering = ref(false)
const hoveringPath = ref<string>()

const openFile = async () => {
  path.value = await open({
    multiple: false,
    directory: false,
    filters: videoFilters,
  }) ?? undefined
}

let unlistenFn: UnlistenFn | undefined

const correctFileType = computed(() => {
  return videoFilters.find((filter) => {
    return filter.extensions.find((extension) => {
      return hoveringPath.value?.endsWith(extension)
    })
  })
})

onMounted(async () => {
  unlistenFn = await getCurrentWebview()
    .onDragDropEvent((event) => {
      if (event.payload.type === 'enter') {
        hoveringPath.value = event.payload.paths.at(0)
      } else if (event.payload.type === 'over') {
        hovering.value = true
      } else if (event.payload.type === 'leave') {
        hovering.value = false
        hoveringPath.value = undefined
      } else if (event.payload.type === 'drop') {
        if (!correctFileType.value) {
          return
        }

        path.value = event.payload.paths.at(0)
        emit('drop')
      }
    })
})

onUnmounted(() => unlistenFn?.())
</script>

<template>
  <div class="flex flex-col flex-1 gap-2 rounded-(--ui-radius) overflow-hidden">
    <button
      class="flex flex-col items-center justify-center h-full w-full hover:bg-muted/50 transition-colors"
      @click="openFile"
    >
      <LayoutGroup>
        <AnimatePresence>
          <motion.span
            layout
            class="p-4 shrink-0 flex items-center justify-center rounded-full border border-dashed border-muted"
          >
            <UIcon
              name="i-lucide-upload"
              class="text-muted size-8"
            />
          </motion.span>

          <motion.div
            v-if="hoveringPath"
            layout
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
          >
            <motion.p
              layout="position"
              class="font-medium text-muted text-center mt-4"
              layout-id="hovering-path"
            >
              {{ hoveringPath.split('\\').at(-1) }}
            </motion.p>

            <motion.p
              v-if="!correctFileType"
              class="font-medium text-error text-sm mt-1 capitalize"
            >
              wrong file type
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </button>
  </div>
</template>
