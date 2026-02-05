<script setup lang="ts">
import { Motion, motion, RowValue } from 'motion-v'
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
          class="bg-default p-2 relative"
          :style="{ borderRadius: showLogs && linesDebounced.length > 1 ? '6px' : '24px' }"
        >
          <Motion
            v-if="showLogs && linesDebounced.length > 1"
            :exit="{ opacity: 0 }"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.5 }"
          >
            <pre
              ref="stdoutContainer"
              class="text-xs max-h-96 w-4xl max-w-4xl mb-2 whitespace-pre-line overflow-auto"
            >
              {{ linesDebounced.join('\n') }}
            </pre>
          </Motion>

          <motion.div
            layout
            class="flex items-center justify-center gap-2 overflow-hidden"
          >
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
              layout
              :exit="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :initial="{ opacity: 0 }"
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
              :exit="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :initial="{ opacity: 0 }"
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

            <Motion
              v-if="linesDebounced.length > 1"
              layout
            >
              <UButton
                icon="i-lucide-chevron-up"
                variant="subtle"
                @click="showLogs = !showLogs"
              />
            </Motion>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  </AppDockContainer>
</template>
