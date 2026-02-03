<script setup lang="ts">
import { resolutions, videoEncoders, videoExportExtensions, videoExportItems } from '~/constants'
import { injectVideoRootContext } from './VideoRoot.vue'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import { motion, RowValue } from 'motion-v'
import { save } from '@tauri-apps/plugin-dialog'
import { openPath } from '@tauri-apps/plugin-opener'
import { useKeepScrollBottom } from '~/hooks/useKeepScrollBottom'
import { useCommandArgs } from '~/hooks/useCommandArgs'

const props = defineProps<{
  path: string
}>()

const videoRootContext = injectVideoRootContext()

const stdoutContainer = useTemplateRef('stdoutContainer')
const { updateScrollPosition } = useKeepScrollBottom({
  container: stdoutContainer,
  threshold: 50,
})

const optionsStore = useOptionsStore()
const { encoderOptions, extraArguments, extraVideoArguments, extraAudioArguments } = storeToRefs(optionsStore)

const targetBitrate = computed(() => {
  return (encoderOptions.value.fileSizeMb * 8192) / duration.value - 196
})

const exportType = computed(() => {
  switch (encoderOptions.value.outputExtension) {
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'dvr':
      return 'video'
    case 'webp':
    case 'avif':
      return 'animated'
    default:
      return 'image'
  }
})

const { parsedArgs: parsedArgsAudioFilter, parseArgsFromString: parseArgsFromStringFilter }
  = useCommandArgs(
    'filter',
    {
      atempo: computed(() => encoderOptions.value.speed !== 1 ? `atempo=${encoderOptions.value.speed}` : undefined),
    },
    computed(() => parseArgsFromStringFilter(extraAudioArguments.value)),
  )

const { parsedArgs: parsedArgsVideoFilter } = useCommandArgs(
  'filter',
  {
    fps: computed(() => encoderOptions.value.fps),
    setpts: computed(() => encoderOptions.value.speed !== 1 ? `PTS/${encoderOptions.value.speed}` : undefined),
    crop: computed(() => {
      if (!videoRootContext.crop.value.width || !videoRootContext.crop.value.height) {
        return
      }

      return `${videoRootContext.crop.value.width || videoRootContext.video.value.width}:${videoRootContext.crop.value.height || videoRootContext.video.value.height}:${videoRootContext.crop.value.left}:${videoRootContext.crop.value.top}`
    }),
  },
  computed(() => parseArgsFromStringFilter(extraVideoArguments.value)),
)

const { parsedArgs, parseArgsFromString } = useCommandArgs(
  'arg',
  {
    'y': true,
    'an': computed(() => encoderOptions.value.noAudio),
    's': computed(() => encoderOptions.value.resolution),
    'ss': computed(() => formatSeconds(videoRootContext.trim.value.start)),
    'to': computed(() => formatSeconds(videoRootContext.trim.value.end || videoRootContext.video.value.duration!)),
    'i': computed(() => props.path),
    'maxrate': computed(() => `${Math.round(targetBitrate.value)}k`),
    'bufsize': computed(() => `${Math.round(targetBitrate.value / 2)}k`),
    'vcodec': computed(() =>
      exportType.value === 'video' || encoderOptions.value.outputExtension === 'avif'
        ? encoderOptions.value.encoder
        : undefined,
    ),
    'loop': computed(() => encoderOptions.value.outputExtension === 'webp' && '0'),
    'quality': computed(() => encoderOptions.value.outputExtension === 'webp' && webpQuality.value),
    'compression_level': computed(() => encoderOptions.value.outputExtension === 'webp' && webpCompressionLevel.value),
    'frames:v': computed(() => exportType.value === 'image' && '1'),
    'filter:v': computed(() => encoderOptions.value.encoder !== 'copy' && parsedArgsVideoFilter.value.join(',')),
    'filter:a': computed(() => encoderOptions.value.encoder !== 'copy' && parsedArgsAudioFilter.value.join(',')),
  },
  computed(() => parseArgsFromString(extraArguments.value)),
)

const savePath = ref('')

const webpCompressionLevel = ref(4)
const webpQuality = ref(50)

const duration = computed(
  () =>
    ((videoRootContext.trim.value.end || videoRootContext.video.value.duration!)
      - videoRootContext.trim.value.start)
    / encoderOptions.value.speed,
)

const { running, spawn, linesDebounced, kill, progress, etaAnimated } = useFFmpeg(duration)

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
  await spawn('binaries/ffmpeg', [...parsedArgs.value, path])
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
    <UTooltip :text="parsedArgs.join(' ').toString()">
      <p class="text-sm text-muted font-medium truncate">
        {{ parsedArgs.join(" ").toString() }}
      </p>
    </UTooltip>

    <div
      class="grid gap-4 @2xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 items-end"
    >
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
        <div class="flex gap-2">
          <UInput
            v-model="extraArguments"
            variant="soft"
            color="neutral"
            placeholder="eg. -preset p4 -lookahead_level 5"
            class="w-full"
          />

          <UButton
            v-if="extraArguments"
            icon="i-lucide-x"
            variant="soft"
            square
            :ui="{ base: 'rounded' }"
            @click="extraArguments = ''"
          />
        </div>
      </UFormField>

      <UFormField label="Extra Video Arguments">
        <div class="flex gap-2">
          <UInput
            v-model="extraVideoArguments"
            variant="soft"
            color="neutral"
            placeholder="eg. transpose=1,transpose=0"
            class="w-full"
          />

          <UButton
            v-if="extraVideoArguments"
            icon="i-lucide-x"
            variant="soft"
            square
            :ui="{ base: 'rounded' }"
            @click="extraVideoArguments = ''"
          />
        </div>
      </UFormField>

      <UFormField label="Extra Audio Arguments">
        <div class="flex gap-2">
          <UInput
            v-model="extraAudioArguments"
            variant="soft"
            color="neutral"
            placeholder="eg. volume=10.0"
            class="w-full"
          />

          <UButton
            v-if="extraAudioArguments"
            icon="i-lucide-x"
            variant="soft"
            square
            :ui="{ base: 'rounded' }"
            @click="extraAudioArguments = ''"
          />
        </div>
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
      {{ linesDebounced.join("\n") }}
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

          <Motion layout>
            <VideoEncoderHelp :encoder="encoderOptions.encoder" />
          </Motion>
        </motion.div>
      </LayoutGroup>
    </AppDockContainer>
  </section>
</template>
