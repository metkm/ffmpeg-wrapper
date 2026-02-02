<script setup lang="ts">
import { resolutions, videoEncoders, videoExportExtensions, videoExportItems } from '~/constants'
import { injectVideoRootContext } from './VideoRoot.vue'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import { motion, RowValue } from 'motion-v'
import { save } from '@tauri-apps/plugin-dialog'
import { openPath } from '@tauri-apps/plugin-opener'
import { useKeepScrollBottom } from '~/hooks/useKeepScrollBottom'

const props = defineProps<{
  path: string
}>()

const stdoutContainer = useTemplateRef('stdoutContainer')
const { updateScrollPosition } = useKeepScrollBottom({
  container: stdoutContainer,
  threshold: 50,
})

const { encoderOptions } = useOptionsStore()

const videoRootContext = injectVideoRootContext()

const savePath = ref('')
const extraArguments = ref('')
const extraVideoArguments = ref('')
const extraAudioArguments = ref('')

const webpCompressionLevel = ref(4)
const webpQuality = ref(50)

const duration = computed(() =>
  ((videoRootContext.trim.value.end || videoRootContext.video.value.duration!) - videoRootContext.trim.value.start) / encoderOptions.speed,
)

const exportType = computed(() => {
  if (encoderOptions.outputExtension === 'mp4' || encoderOptions.outputExtension === 'avi' || encoderOptions.outputExtension === 'mov') {
    return 'video'
  }

  if (encoderOptions.outputExtension === 'webp' || encoderOptions.outputExtension === 'avif') {
    return 'animated'
  }

  return 'image'
})

const { running, spawn, linesDebounced, kill, progress, etaAnimated } = useFFmpeg(duration)

const targetBitrate = computed(() => {
  return encoderOptions.fileSizeMb * 8192 / duration.value - 196
})

const process = async () => {
  const path = await save({
    defaultPath: `${encoderOptions.outputName || 'output'}.${encoderOptions.outputExtension}`,
    filters: [{
      name: 'video',
      extensions: videoExportExtensions,
    }],
  })

  if (!path) {
    return
  }

  savePath.value = path

  const baseArgs = [
    '-y',
    '-ss', formatSeconds(videoRootContext.trim.value.start),
    '-to', formatSeconds(videoRootContext.trim.value.end || videoRootContext.video.value.duration!),
    '-i', props.path,
    '-maxrate', `${Math.round(targetBitrate.value)}k`,
    '-bufsize', `${Math.round(targetBitrate.value / 2)}k`,
    '-rc', 'vbr',
  ]

  const videoFilters = [`fps=${encoderOptions.fps}`]
  const audioFilters = []

  // in one of the videos for some reason videoHeight is given 2 more pixels. Might be something with the aspect ratio but i don't know
  if (videoRootContext.crop.value.width || videoRootContext.crop.value.height) {
    const crop = `${videoRootContext.crop.value.width || videoRootContext.video.value.width}:${videoRootContext.crop.value.height || videoRootContext.video.value.height}:${videoRootContext.crop.value.left}:${videoRootContext.crop.value.top}`
    videoFilters.push(`crop=${crop}`)
  }

  if (encoderOptions.speed !== 1) {
    videoFilters.push(`setpts=PTS/${encoderOptions.speed}`)
    audioFilters.push(`atempo=${encoderOptions.speed}`)
  }

  if (encoderOptions.noAudio) {
    baseArgs.push('-an')
  }

  if (encoderOptions.resolution) {
    baseArgs.push('-s', encoderOptions.resolution)
  }

  if (exportType.value === 'video') {
    baseArgs.push('-vcodec', encoderOptions.encoder)
  } else if (exportType.value === 'animated') {
    baseArgs.push('-loop', '0')

    if (encoderOptions.outputExtension === 'webp') {
      baseArgs.push('-compression_level', `${webpCompressionLevel.value}`, '-quality', `${webpQuality.value}`)
    } else if (encoderOptions.outputExtension === 'avif') {
      baseArgs.push('-vcodec', 'av1_nvenc')
    }
  } else {
    baseArgs.push('-frames:v', '1')
  }

  if (extraArguments.value.length > 0) {
    const a = extraArguments.value.split(',')

    for (const x of a) {
      const [l, r] = x.split(' ')

      if (l && r) {
        baseArgs.push(l, r)
      }
    }
  }

  if (extraVideoArguments.value.length > 0) {
    videoFilters.push(...extraVideoArguments.value.split(','))
  }

  if (extraAudioArguments.value.length > 0) {
    audioFilters.push(...extraAudioArguments.value.split(','))
  }

  if (videoFilters.length > 0) {
    baseArgs.push('-filter:v', videoFilters.join(','))
  }

  if (audioFilters.length > 0) {
    baseArgs.push('-filter:a', audioFilters.join(','))
  }

  baseArgs.push(path)
  await spawn('binaries/ffmpeg', baseArgs)
}

watch(linesDebounced, () => {
  updateScrollPosition()
})

defineShortcuts({
  enter: process,
})
</script>

<template>
  <section class="flex flex-col gap-4 @container">
    <div class="grid gap-4 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 items-end">
      <UFormField
        label="Encoder"
        description="h264 is recommended"
      >
        <USelect
          v-model="encoderOptions.encoder"
          :items="videoEncoders"
          variant="soft"
          :disabled="exportType !== 'video'"
        />
      </UFormField>

      <UFormField
        label="Target file size"
        :description="`${targetBitrate.toFixed(0)} bitrate`"
      >
        <UInputNumber
          v-model="encoderOptions.fileSizeMb"
          :min="0"
          variant="soft"
          :disabled="exportType === 'image' || encoderOptions.outputExtension === 'webp'"
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
          :disabled="exportType === 'image'"
        />
      </UFormField>

      <UFormField
        label="FPS"
        description="Frames per second"
      >
        <USelect
          v-model="encoderOptions.fps"
          :items="[10, 20, 24, 30, 60, 144, 180, 240]"
          color="neutral"
          variant="soft"
          :disabled="exportType === 'image'"
        />
      </UFormField>

      <UFormField label="Resolution">
        <div class="flex items-center gap-2">
          <USelect
            v-model="encoderOptions.resolution"
            :items="resolutions"
            color="neutral"
            variant="soft"
            placeholder="default"
          />

          <UButton
            v-if="encoderOptions.resolution"
            icon="i-lucide-x"
            variant="soft"
            square
            :ui="{ base: 'rounded' }"
            @click="encoderOptions.resolution = undefined"
          />
        </div>
      </UFormField>

      <UFormField label="Extra Arguments">
        <UInput
          v-model="extraArguments"
          variant="soft"
          color="neutral"
          placeholder="eg. -preset p4, -lookahead_level 5"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Extra Video Arguments">
        <UInput
          v-model="extraVideoArguments"
          variant="soft"
          color="neutral"
          placeholder="eg. transpose=1,transpose=0"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Extra Audio Arguments">
        <UInput
          v-model="extraAudioArguments"
          variant="soft"
          color="neutral"
          placeholder="eg. volume=10.0"
          class="w-full"
        />
      </UFormField>

      <UCheckbox
        v-model="encoderOptions.noAudio"
        label="Remove audio"
        :disabled="exportType !== 'video'"
      />

      <template v-if="encoderOptions.outputExtension === 'webp'">
        <UFormField
          label="Compression level"
          description="This is a quality/speed tradeoff. Higher values give better quality for a given size at the cost of increased encoding time. (0 - 6)"
        >
          <UInputNumber
            v-model="webpCompressionLevel"
            :min="0"
            :max="6"
            variant="soft"
          />
        </UFormField>

        <UFormField
          label="Quality"
          description="0 - 100"
        >
          <UInputNumber
            v-model="webpQuality"
            :min="0"
            :max="100"
            variant="soft"
          />
        </UFormField>
      </template>
    </div>

    <pre
      v-if="linesDebounced.length > 0"
      ref="stdoutContainer"
      class="text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) whitespace-pre-line"
    >
      {{ linesDebounced.join('\n') }}
    </pre>

    <AppDockContainer side="bottom-center">
      <LayoutGroup>
        <motion.div
          layout
          class="flex items-center gap-2 p-2 backdrop-blur-2xl shadow max-w-max border border-muted overflow-hidden relative"
          :class="{ 'pb-2.5': running }"
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
                @click="openPath(savePath.split('\\').slice(0, -1).join('\\'))"
              >
                {{ savePath.split('\\').slice(0, -1).join('\\') }}
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

            <motion.div
              v-if="running"
              class="absolute bottom-0 w-full h-0.5 bg-accented transition-all"
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
    </AppDockContainer>
  </section>
</template>
