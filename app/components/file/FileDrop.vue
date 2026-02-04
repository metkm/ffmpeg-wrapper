<script setup lang="ts">
import type { UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { open } from '@tauri-apps/plugin-dialog'
import { motion } from 'motion-v'
import { videoImportExtensions } from '~/constants'
import { usePathsStore } from '~/stores/usePathsStore'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [path: string]
}>()

const { addPathHistory } = usePathsStore()

const modelValue = defineModel<string>()

const hovering = ref(false)
const hoveringPath = ref<string>()

const openFile = async () => {
  modelValue.value = await open({
    multiple: false,
    directory: false,
    filters: [{
      name: 'video',
      extensions: videoImportExtensions,
    }],
  }) ?? undefined

  await nextTick()

  if (modelValue.value) {
    emit('select', modelValue.value)
    addPathHistory(modelValue.value)
  }
}

let unlistenFn: UnlistenFn | undefined

const correctFileType = computed(() => {
  return videoImportExtensions.some((ext) => {
    return hoveringPath.value?.endsWith(ext)
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

        const path = event.payload.paths.at(0)

        if (!path)
          return

        modelValue.value = path
        emit('select', path)
        addPathHistory(path)
      }
    })
})

onUnmounted(() => unlistenFn?.())
</script>

<template>
  <div class="flex flex-col gap-2 rounded-md overflow-hidden">
    <button
      class="flex flex-col items-center justify-center h-full w-full transition-colors"
      :class="{
        'cursor-no-drop pointer-events-none': disabled,
        'hover:bg-muted': !disabled,
      }"
      @click="openFile"
    >
      <LayoutGroup>
        <AnimatePresence>
          <motion.span
            layout
            class="p-4 shrink-0 flex items-center justify-center rounded-full border border-dashed border-muted transition-colors"
            :class="{ 'bg-muted': disabled }"
          >
            <UIcon
              :name="disabled ? 'i-lucide-circle-off' : 'i-lucide-upload'"
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
