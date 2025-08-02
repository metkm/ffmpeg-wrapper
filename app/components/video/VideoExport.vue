<script setup lang="ts">
import { appLocalDataDir } from '@tauri-apps/api/path'
import { save } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { parametersPerEncoders, videoFilters } from '~/constants'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import type { Encoder } from '~/types/parameters'
import type { Video } from '~/types/video'
import { motion } from 'motion-v'

const props = defineProps<{
  video: Video
  path: string
}>()

const emit = defineEmits<{
  exportEnd: []
}>()

const targetBitrate = computed(() => output.targetFileSize * 8192 / (props.video.range[1] - props.video.range[0]) - 196)
const duration = computed(() => props.video.range[1] - props.video.range[0])

const { processing, progress, spawn, kill, stop, stdoutLines } = useFFmpeg(duration)

const encoder = ref<Encoder>('h264_nvenc')
const twoPass = ref<boolean>(false)
const args = ref<string[]>([])

const output = reactive({
  savePath: null as string | null,
  targetFileSize: 10,
})

const process = async () => {
  output.savePath = await save({
    defaultPath: 'output.mp4',
    filters: videoFilters,
  })

  if (!output.savePath) return

  const argsBase = [
    '-y',
    '-ss', formatSeconds(props.video.range[0] || 0),
    '-to', formatSeconds(props.video.range[1] || 1),
    '-i', props.path,
    '-vcodec', encoder.value,
    // '-b:v', `${targetBitrate.value}k`,
    '-maxrate', `${targetBitrate.value}k`,
    '-bufsize', `${targetBitrate.value / 2}k`,
    '-vf', `crop=${props.video.crop.width}:${props.video.crop.height}:${props.video.crop.left}:${props.video.crop.top}`,
    ...args.value,
  ]

  if (twoPass.value) {
    argsBase.push('-passlogfile', `${await appLocalDataDir()}\\ffmpeg2pass.log`)
  }

  if (encoder.value === 'av1_nvenc') {
    argsBase.push('-rc', 'vbr')

    if (twoPass.value) {
      const args = [
        ...argsBase,
        '-an',
        '-pass', '1',
        '-f', 'mp4',
        'NUL',
      ]

      await spawn(args)
      argsBase.push('-pass', '2')
    }
  }

  argsBase.push(output.savePath)
  await spawn(argsBase)

  kill()
  emit('exportEnd')
}
</script>

<template>
  <section class="flex flex-col gap-4 pb-[calc(var(--spacing)*4+50px)] z-50">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-(--ui-radius)">
      <UFormField
        label="Encoder"
        description="encoder that will be used to re-encode"
      >
        <USelect
          v-model="encoder"
          :items="Object.keys(parametersPerEncoders)"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="target file size"
        :description="`${targetBitrate.toFixed(0)} bitrate`"
        class="capitalize"
      >
        <UInputNumber
          v-model="output.targetFileSize"
          :min="0"
          color="neutral"
          class="w-full after:content-['(MB)'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:pl-18 after:font-medium after:text-muted after:pointer-events-none"
        />
      </UFormField>

      <CommandParameters
        v-model="args"
        :encoder="encoder"
      />

      <UCheckbox
        v-model="twoPass"
        label="Two pass"
        variant="card"
        description="analyze video twice for better compression (might be useful for av1 encoders)"
      />
    </div>

    <pre
      v-if="stdoutLines.length > 0"
      ref="stdoutElement"
      class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
      style="overflow-wrap: break-word;"
    >{{ stdoutLines.join('\n') }}</pre>

    <LayoutGroup>
      <section
        layout
        class="fixed bottom-4 inset-x-2 flex justify-center"
      >
        <motion.div
          layout
          class="flex items-center gap-2 p-2 backdrop-blur-2xl max-w-max border border-muted overflow-hidden relative"
          :style="{ borderRadius: '999px' }"
        >
          <AnimatePresence>
            <Motion layout>
              <UButton
                to="/"
                icon="i-lucide-x"
                variant="soft"
                color="neutral"
                square
              />
            </Motion>

            <Motion
              v-if="output.savePath"
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
                @click="revealItemInDir(output.savePath)"
              >
                {{ output.savePath }}
              </UButton>
            </Motion>

            <Motion
              v-if="processing"
              layout
              :exit="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :initial="{ opacity: 0 }"
            >
              <UButton
                icon="i-lucide-circle-stop"
                color="warning"
                variant="subtle"
                @click="stop"
              >
                Stop
              </UButton>
            </Motion>

            <Motion layout>
              <UButton
                icon="i-lucide-folder-down"
                :loading="processing"
                @click="process"
              >
                <motion.p
                  layout="position"
                  class="text-center w-11"
                >
                  {{ processing && progress?.eta ? `${progress.eta.toFixed(0)}s` : 'Export' }}
                </motion.p>
              </UButton>
            </Motion>

            <motion.div
              v-if="processing"
              class="absolute bottom-0 w-full bg-accented transition-all"
              :exit="{ transform: `translateY(100%)` }"
              :initial="{ transform: `translateY(100%)` }"
              :animate="{ transform: `translateY(0)` }"
            >
              <div
                class="h-0.5 bg-primary transition-all"
                :style="{ width: `${progress?.percent}%` }"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>
    </LayoutGroup>
  </section>
</template>
