<script setup lang="ts">
import { Motion, motion, RowValue, type MotionProps } from 'motion-v'
import { openPath } from '@tauri-apps/plugin-opener'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import { injectVideoRootContext } from './VideoRoot.vue'
import { videoExportExtensions, videoExportItems } from '~/constants'
import { save } from '@tauri-apps/plugin-dialog'
import { useKeepScrollBottom } from '~/hooks/useKeepScrollBottom'

const props = defineProps<{
  args: string[]
}>()

const videoRootContext = injectVideoRootContext()

const stdoutContainer = useTemplateRef('stdoutContainer')
const { updateScrollPosition } = useKeepScrollBottom({
  container: stdoutContainer,
  threshold: 50,
})

const optionsStore = useOptionsStore()
const { encoderOptions } = storeToRefs(optionsStore)

const savePath = ref('')
const showLogs = ref(false)

const { running, spawn, linesDebounced, kill, progress, etaAnimated } = useFFmpeg(videoRootContext.duration)

const process = async () => {
  const path = await save({
    defaultPath: `${encoderOptions.value.outputName || 'output'}.${encoderOptions.value.outputExtension}`,
    filters: [
      {
        name: 'video',
        extensions: videoExportExtensions,
      },
    ],
  })

  if (!path) {
    return
  }

  savePath.value = path
  await spawn('binaries/ffmpeg', [...props.args, path])
}

watch(linesDebounced, updateScrollPosition)

defineShortcuts({
  enter: process,
})

const dockVariants: MotionProps['variants'] = {
  expanded: {
    transition: {
      delayChildren: 0.3,
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
        :style="{ borderRadius: showLogs && linesDebounced.length > 1 ? '7px' : '24px' }"
      >
        <motion.div
          layout
          class="bg-default relative overflow-hidden"
          :style="{ borderRadius: showLogs && linesDebounced.length > 1 ? '6px' : '24px' }"
          :initial="false"
          :animate="showLogs ? 'expanded' : 'minimized'"
          :variants="dockVariants"
          exit="minimized"
        >
          <AnimatePresence mode="popLayout">
            <Motion
              v-if="showLogs"
              layout
              :variants="logsVariants"
              class="h-96 w-4xl"
            >
              <pre
                v-if="linesDebounced.length > 1"
                ref="stdoutContainer"
                class="text-xs h-96 w-4xl whitespace-pre-line overflow-auto p-2"
              >
                {{ linesDebounced.join('\n') }}
              </pre>
              <UEmpty
                v-else
                title="Logs will shop up here."
                class="w-full h-full"
                variant="naked"
              />
            </Motion>

            <motion.div
              layout
              class="flex items-center justify-center gap-2 overflow-hidden bg-default p-2 relative"
              :initial="false"
              :animate="running ? 'expanded' : 'minimized'"
              exit="stopped"
              :variants="dockVariants"
            >
              <AnimatePresence mode="popLayout">
                <Motion layout>
                  <UButton
                    to="/"
                    icon="i-lucide-x"
                    variant="soft"
                    square
                    class="will-change-transform"
                  />
                </Motion>

                <Motion
                  v-if="savePath"
                  layout="position"
                  :transition="{ delay: 0.3 }"
                  :variants="itemVariants"
                  initial="minimized"
                  animate="expanded"
                  exit="minimized"
                >
                  <UButton
                    icon="i-lucide-folder-symlink"
                    variant="link"
                    color="neutral"
                    square
                    class="-ml-0.5"
                    @click="openPath(savePath.split('\\').slice(0, -1).join('\\'))"
                  >
                    {{ savePath.split("\\").slice(0, -1).join("\\") }}
                  </UButton>
                </Motion>

                <Motion layout>
                  <UFieldGroup>
                    <UInput
                      v-model="encoderOptions.outputName"
                      placeholder="output"
                      variant="soft"
                      class="w-26"
                    />

                    <USelectMenu
                      v-model="encoderOptions.outputExtension"
                      :items="videoExportItems"
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
                    @click="showLogs = !showLogs"
                  />
                </Motion>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  </AppDockContainer>
</template>
