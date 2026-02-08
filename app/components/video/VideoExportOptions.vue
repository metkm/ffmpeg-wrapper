<script setup lang="ts">
import { resolutions, videoEncoders } from '~/constants'
import { injectVideoRootContext } from './VideoRoot.vue'
import { useCommandArgs } from '~/hooks/useCommandArgs'

const props = defineProps<{
  path: string
}>()

const videoRootContext = injectVideoRootContext()

const optionsStore = useOptionsStore()
const { encoderOptions, extraArguments, extraVideoArguments, extraAudioArguments, exportType, rememberSavePath, savePath } = storeToRefs(optionsStore)

const targetBitrate = computed(() => {
  return (encoderOptions.value.fileSizeMb * 8192) / videoRootContext.duration.value - 196
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

const { argsValidFiltered, parsedArgs, parseArgsFromString, disabledArgs, toggleArgDisable, parsedArgsText } = useCommandArgs(
  'arg',
  {
    'y': true,
    'an': computed(() => encoderOptions.value.noAudio),
    'ss': computed(() => formatSeconds(videoRootContext.trim.value.start)),
    'to': computed(() => formatSeconds(videoRootContext.trim.value.end || videoRootContext.video.value.duration!)),
    'i': computed(() => props.path),
    's': computed(() => encoderOptions.value.resolution),
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

const webpCompressionLevel = ref(4)
const webpQuality = ref(50)

const bitrateArgParsed = computed(() => {
  const v = argsValidFiltered.value['b:v']
  if (!v) {
    return undefined
  }

  // this is some kind of bandaid now
  const x = Number(v.toString().replace('k', ''))

  if (isNaN(x)) {
    return
  }

  return x
})
</script>

<template>
  <section class="flex flex-col gap-2">
    <UCollapsible class="group">
      <UTooltip :text="parsedArgsText">
        <UButton
          variant="soft"
          trailing-icon="i-lucide-chevron-down"
          block
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform',
          }"
          size="sm"
          class="rounded-md"
        >
          <p class="truncate">
            Parsed arguments (given to ffmpeg)
          </p>
        </UButton>
      </UTooltip>

      <template #content>
        <div class="mt-2 m-0.5">
          <ol class="text-xs font-medium divide-y divide-muted ring ring-default rounded-md">
            <li
              v-for="([key, value]) in Object.entries(argsValidFiltered)"
              :key="key"
              class="flex items-center gap-4 justify-between *:truncate p-2"
            >
              <div>
                <p>{{ key }}</p>
                <p>{{ value }}</p>
              </div>

              <UButton
                class="shrink-0"
                :variant="disabledArgs.has(key) ? 'soft' : 'solid'"
                size="xs"
                @click="toggleArgDisable(key)"
              >
                {{ disabledArgs.has(key) ? 'Enable' : 'Disable' }}
              </UButton>
            </li>
          </ol>

          <UTooltip :text="parsedArgsText">
            <p class="truncate text-xs mt-2 bg-muted rounded-md p-1">
              {{ parsedArgsText }}
            </p>
          </UTooltip>
        </div>
      </template>
    </UCollapsible>

    <div class="grid gap-4 items-end">
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

        <p
          v-if="bitrateArgParsed && bitrateArgParsed > targetBitrate"
          class="text-xs text-warning-400 mt-1"
        >
          The target file size might be higher than {{ encoderOptions.fileSizeMb }}Mb if -b:v given more than {{ Math.round(targetBitrate) }}k
        </p>
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

      <UCheckbox
        v-model="rememberSavePath"
        label="Remember save path"
        :description="savePath"
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

    <VideoExportDock :args="parsedArgs" />
  </section>
</template>
