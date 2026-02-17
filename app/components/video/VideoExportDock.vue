<script setup lang="ts">
import { Motion, motion, RowValue, type MotionProps } from 'motion-v'
import { openPath } from '@tauri-apps/plugin-opener'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import { injectVideoRootContext } from './VideoRoot.vue'
import { save } from '@tauri-apps/plugin-dialog'
import { useKeepScrollBottom } from '~/hooks/useKeepScrollBottom'
import { fileExtensionNames, outputExtensionSelectItems } from '~/constants'
import { dirname } from '@tauri-apps/api/path'

const props = defineProps<{
  args: string[]
}>()

const videoRootContext = injectVideoRootContext()

const showLogs = ref(false)

const stdoutContainer = useTemplateRef('stdoutContainer')
const { updateScrollPosition } = useKeepScrollBottom({
  container: stdoutContainer,
  threshold: 50,
})

const optionsStore = useOptionsStore()
const { encoderOptions, savePath, rememberSavePath } = storeToRefs(optionsStore)

const { running, spawn, linesDebounced, kill, progress, etaAnimated, error } = useFFmpeg(videoRootContext.durationAfterCut)

const process = async () => {
  let path = rememberSavePath.value && savePath.value
    ? savePath.value
    : await save({
        defaultPath: `${encoderOptions.value.outputName || 'output'}.${encoderOptions.value.outputExtension}`,
        filters: [
          {
            name: 'video',
            extensions: fileExtensionNames,
          },
        ],
      })

  if (!path) {
    return
  }

  savePath.value = path

  path = path.replace('{encoder}', encoderOptions.value.encoder)
  path = path.replace('{fps}', encoderOptions.value.fps?.toString() || videoRootContext.videoInfo.value.fps?.toString() || 'unknown')
  path = path.replace('{resolution}', encoderOptions.value.resolution || videoRootContext.videoInfo.value.resolution || 'unknown')
  path = path.replace('{exportCount}', optionsStore.exportCount.toString())

  if (videoRootContext.videoInfo.value.name) {
    path = path.replace('{name}', videoRootContext.videoInfo.value.name)
  }

  await spawn('binaries/ffmpeg', [...props.args, path])
  optionsStore.exportCount += 1
}

defineShortcuts({
  enter: process,
})

const dirName = computedAsync(
  async () => dirname(savePath.value),
  '',
)

watch(linesDebounced, updateScrollPosition)

const dockVariants: MotionProps['variants'] = {
  expanded: {
    transition: {
      delayChildren: 0.2,
    },
  },
}

const logsVariants: MotionProps['variants'] = {
  expanded: {
    opacity: 1,
  },
  minimized: {
    opacity: 0,
  },
}

const itemVariants: MotionProps['variants'] = {
  expanded: {
    opacity: 1,
    y: 0,
  },
  minimized: {
    opacity: 0,
    y: 40,
  },
}
</script>

<template>
  <AppDockContainer side="bottom-center">
    <LayoutGroup>
      <motion.div
        layout
        class="bg-border p-px"
        :style="{ borderRadius: '24px' }"
      >
        <motion.div
          layout
          class="bg-default relative overflow-hidden"
          :style="{ borderRadius: '24px' }"
          :initial="false"
          :animate="showLogs ? 'expanded' : 'minimized'"
          :variants="dockVariants"
          exit="minimized"
        >
          <AnimatePresence>
            <Motion
              v-if="showLogs"
              layout
              :variants="logsVariants"
              class="w-4xl"
            >
              <AnimatePresence mode="wait">
                <Motion
                  v-if="linesDebounced.length > 1"
                  :exit="{ opacity: 0 }"
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  layout="position"
                >
                  <pre
                    ref="stdoutContainer"
                    class="text-xs h-96 w-4xl whitespace-pre-line overflow-auto p-2 pb-0"
                  >
                  {{ linesDebounced.join('\n') }}
                </pre>
                </Motion>

                <Motion
                  v-else
                  layout
                  :exit="{ opacity: 0 }"
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  class="m-2 mb-0"
                >
                  <UEmpty
                    description="Logs will show up here."
                    class="rounded-2xl"
                    variant="subtle"
                  />
                </Motion>
              </AnimatePresence>
            </Motion>
          </AnimatePresence>

          <motion.div
            layout
            class="flex items-center justify-center gap-2 overflow-hidden bg-default p-2 relative"
            :initial="false"
            :animate="running ? 'expanded' : 'minimized'"
            exit="minimized"
            :variants="dockVariants"
          >
            <AnimatePresence mode="popLayout">
              <Motion layout>
                <UButton
                  to="/"
                  icon="i-lucide-x"
                  variant="subtle"
                  square
                  class="will-change-transform"
                />
              </Motion>

              <Motion
                v-if="savePath"
                layout
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
              >
                <UButton
                  icon="i-lucide-folder-symlink"
                  variant="link"
                  color="neutral"
                  square
                  class="-ml-0.5"
                  @click="openPath(dirName)"
                >
                  {{ dirName }} {{ optionsStore.exportCount }}
                </UButton>
              </Motion>

              <Motion layout>
                <UFieldGroup>
                  <UInput
                    v-model="encoderOptions.outputName"
                    placeholder="output"
                    variant="soft"
                    class="max-w-48"
                  />

                  <USelectMenu
                    v-model="encoderOptions.outputExtension"
                    :items="outputExtensionSelectItems"
                    class="w-24"
                    variant="soft"
                    :search-input="false"
                  />
                </UFieldGroup>
              </Motion>

              <Motion
                v-if="running"
                layout
                :variants="itemVariants"
              >
                <UButton
                  icon="i-lucide-circle-stop"
                  color="warning"
                  variant="subtle"
                  @click="kill"
                >
                  Stop
                </UButton>
              </Motion>

              <Motion layout>
                <UButton
                  icon="i-lucide-folder-down"
                  :loading="running"
                  class="overflow-hidden"
                  @click="process"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      v-if="running && progress.eta"
                      :initial="{ translateY: -50 }"
                      :animate="{ translateY: 0 }"
                      :exit="{ translateY: -50 }"
                      class="min-w-11 text-center"
                    >
                      <RowValue :value="etaAnimated" />s
                    </motion.p>
                    <motion.p
                      v-else
                      :initial="{ translateY: 50 }"
                      :animate="{ translateY: 0 }"
                      :exit="{ translateY: 50 }"
                    >
                      Export
                    </motion.p>
                  </AnimatePresence>
                </UButton>
              </Motion>

              <Motion layout>
                <UButton
                  icon="i-lucide-logs"
                  variant="subtle"
                  :color="error ? 'error' : 'primary'"
                  @click="showLogs = !showLogs"
                />
              </Motion>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  </AppDockContainer>
</template>
