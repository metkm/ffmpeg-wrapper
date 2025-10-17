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

const encoder = ref<Encoder>('h264_nvenc')
const twoPass = ref<boolean>(false)
const removeAudio = ref<boolean>(false)
const args = ref<string[]>([])

const output = reactive({
  savePath: null as string | null,
  targetFileSize: 10,
  speed: 1,
  fps: 60,
})

const duration = computed(() => {
  return (props.video.durationRange[1] - props.video.durationRange[0]) / output.speed
})

const { processing, progress, spawn, kill, stop, stdoutLines } = useFFmpeg(duration)

const targetBitrate = computed(() => {
  return output.targetFileSize * 8192 / duration.value - 196
})

const process = async () => {
  output.savePath = await save({
    defaultPath: 'output.mp4',
    filters: videoFilters,
  })

  if (!output.savePath) return

  const argsBase = [
    '-y',
    '-ss', formatSeconds(props.video.durationRange[0] || 0),
    '-to', formatSeconds(props.video.durationRange[1] || 1),
    '-i', props.path,
    '-vcodec', encoder.value,
    // '-b:v', `${targetBitrate.value}k`,
    '-maxrate', `${targetBitrate.value}k`,
    '-bufsize', `${targetBitrate.value / 2}k`,
    '-vf', `crop=${props.video.crop.width}:${props.video.crop.height}:${props.video.crop.left}:${props.video.crop.top},fps=${output.fps}`,
    '-rc', 'vbr',
    ...args.value,
  ]

  if (output.speed !== 1) {
    argsBase.push('-filter:v', `setpts=PTS/${output.speed}`)
    argsBase.push('-filter:a', `atempo=${output.speed}`)
  }

  if (removeAudio.value) {
    argsBase.push('-an')
  }

  if (twoPass.value) {
    argsBase.push('-passlogfile', `${await appLocalDataDir()}\\ffmpeg2pass.log`)
  }

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

  argsBase.push(output.savePath)
  await spawn(argsBase)

  kill()
  emit('exportEnd')
}

const encoderItems = Object.keys(parametersPerEncoders)
</script>

<template>
  <section class="@container">
    <UPageHeader title="Export Settings" />

    <UPageBody class="pb-16">
      <div class="grid gap-4 grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7">
        <UFormField
          label="Encoder"
          description="h264 is recommended"
        >
          <USelect
            v-model="encoder"
            :items="encoderItems"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="target file size"
          :description="`${targetBitrate.toFixed(0)} bitrate`"
        >
          <UInputNumber
            v-model="output.targetFileSize"
            :min="0"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="Video speed"
          description="speed of video"
        >
          <UInputNumber
            v-model="output.speed"
            :min="0.5"
            :max="100"
            :step="0.05"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="FPS"
          description="Frames per second"
        >
          <USelect
            v-model="output.fps"
            :items="[30, 60, 144, 180, 240]"
            color="neutral"
            variant="soft"
          />
        </UFormField>

        <CommandParameters
          v-model="args"
          :encoder="encoder"
        />

        <UCheckbox
          v-model="twoPass"
          label="Two pass"
          description="analyze video twice for better compression (might be useful if output file is bigger than target file size)"
        />

        <UCheckbox
          v-model="removeAudio"
          label="Remove audio"
        />
      </div>

      <pre
        v-if="stdoutLines.length > 0"
        ref="stdoutElement"
        layout
        class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
        style="overflow-wrap: break-word;"
      >
          {{ stdoutLines.join('\n') }}
        </pre>
    </UPageBody>

    <LayoutGroup>
      <section
        layout
        class="fixed bottom-4 inset-x-2 flex justify-center pointer-events-none"
      >
        <motion.div
          layout
          class="flex items-center gap-2 p-2 backdrop-blur-2xl shadow max-w-max border border-muted overflow-hidden relative pointer-events-auto"
          :style="{ borderRadius: '999px' }"
        >
          <AnimatePresence>
            <Motion layout>
              <UButton
                to="/"
                icon="i-lucide-x"
                variant="soft"
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
