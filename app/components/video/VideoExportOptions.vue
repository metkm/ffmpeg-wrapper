<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { encoders, videoFilters } from '~/constants'
import { injectVideoRootContext } from './VideoRoot.vue'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import { motion, RowValue } from 'motion-v'
import { save } from '@tauri-apps/plugin-dialog'
import { appLocalDataDir } from '@tauri-apps/api/path'

const props = defineProps<{
  path: string
}>()

const { encoderOptions } = useOptionsStore()
const videoRootContext = injectVideoRootContext()

const savePath = ref('')

const duration = computed(() =>
  ((videoRootContext.trim.value.end || videoRootContext.video.value.duration!) - videoRootContext.trim.value.start) / encoderOptions.speed,
)

const { running, spawn, linesDebounced, kill, progress, etaAnimated } = useFFmpeg(duration)

const targetBitrate = computed(() => {
  return encoderOptions.fileSizeMb * 8192 / duration.value - 196
})

const process = async () => {
  const path = await save({
    defaultPath: 'output.mp4',
    filters: videoFilters,
  })

  if (!path)
    return

  savePath.value = path

  const argsBase = [
    '-y',
    '-ss', formatSeconds(videoRootContext.trim.value.start),
    '-to', formatSeconds(videoRootContext.trim.value.end || videoRootContext.video.value.duration!),
    '-i', props.path,
    '-vcodec', encoderOptions.encoder,
    '-maxrate', `${targetBitrate.value}k`,
    '-bufsize', `${targetBitrate.value / 2}k`,
    '-vf', `crop=${videoRootContext.crop.value.width || videoRootContext.video.value.width}:${videoRootContext.crop.value.height || videoRootContext.video.value.height}:${videoRootContext.crop.value.left}:${videoRootContext.crop.value.top},fps=${encoderOptions.fps}`,
    '-rc', 'vbr',
  ]

  if (encoderOptions.speed !== 1) {
    argsBase.push('-filter:v', `setpts=PTS/${encoderOptions.speed}`)
    argsBase.push('-filter:a', `atempo=${encoderOptions.speed}`)
  }

  if (encoderOptions.noAudio) {
    argsBase.push('-an')
  }
  if (encoderOptions.twoPass) {
    argsBase.push('-passlogfile', `${await appLocalDataDir()}\\ffmpeg2pass.log`)

    const args = [
      ...argsBase,
      '-an',
      '-pass', '1',
      '-f', 'mp4',
      'NUL',
    ]

    await spawn('binaries/ffmpeg', args)
    argsBase.push('-pass', '2')
  }

  argsBase.push(path)
  await spawn('binaries/ffmpeg', argsBase)
}
</script>

<template>
  <section class="@container">
    <UPageHeader title="Export Settings" />

    <UPageBody class="pb-16">
      <div
        class="grid gap-4 grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7"
      >
        <UFormField
          label="Encoder"
          description="h264 is recommended"
        >
          <USelect
            v-model="encoderOptions.encoder"
            :items="encoders"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="target file size"
          :description="`${targetBitrate.toFixed(0)} bitrate`"
        >
          <UInputNumber
            v-model="encoderOptions.fileSizeMb"
            :min="0"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="Video speed"
          description="speed of video"
        >
          <UInputNumber
            v-model="encoderOptions.speed"
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
            v-model="encoderOptions.fps"
            :items="[30, 60, 144, 180, 240]"
            color="neutral"
            variant="soft"
          />
        </UFormField>

        <UCheckbox
          v-model="encoderOptions.twoPass"
          label="Two pass"
          description="analyze video twice for better compression (might be useful if output file is bigger than target file size)"
        />

        <UCheckbox
          v-model="encoderOptions.noAudio"
          label="Remove audio"
        />
      </div>

      <pre
        v-if="linesDebounced.length > 0"
        ref="stdoutElement"
        layout
        class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
        style="overflow-wrap: break-word;"
      >
        {{ linesDebounced.join('\n') }}
      </pre>
    </UPageBody>

    <section
      layout
      class="fixed bottom-4 inset-x-2 flex justify-center pointer-events-none"
    >
      <LayoutGroup>
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
                @click="revealItemInDir(savePath)"
              >
                {{ savePath }}
              </UButton>
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
                @click="process"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    v-if="running && progress.eta"
                    :initial="{ translateY: -50 }"
                    :animate="{ translateY: 0 }"
                    :exit="{ translateY: -50 }"
                    class="min-w-9 text-center"
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

            <motion.div
              v-if="running"
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
      </LayoutGroup>
    </section>
  </section>
</template>
