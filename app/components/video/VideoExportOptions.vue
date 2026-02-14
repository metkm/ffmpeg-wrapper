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
  const totalBitrate = (encoderOptions.value.fileSizeMb * 8192) / videoRootContext.durationAfterCut.value
  return (totalBitrate - 196) * 0.95
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
      if (!videoRootContext.crop.value.width || !videoRootContext.crop.value.height || !videoRootContext.cropEnabled.value) {
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
    // 'an': computed(() => encoderOptions.value.noAudio),
    'i': computed(() => props.path),
    's': computed(() => encoderOptions.value.resolution),
    'vcodec': computed(() =>
      exportType.value === 'video' || encoderOptions.value.outputExtension === 'avif'
        ? encoderOptions.value.encoder
        : undefined,
    ),
    'maxrate': computed(() => `${Math.round(targetBitrate.value)}k`),
    'bufsize': computed(() => `${Math.round(targetBitrate.value * 2)}k`),
    'loop': computed(() => encoderOptions.value.outputExtension === 'webp' && '0'),
    'quality': computed(() => encoderOptions.value.outputExtension === 'webp' && webpQuality.value),
    'compression_level': computed(() => encoderOptions.value.outputExtension === 'webp' && webpCompressionLevel.value),
    'frames:v': computed(() => exportType.value === 'image' && '1'),
    'filter_complex': computed(() => {
      const trims = videoRootContext.trim.value

      if (
        trims.length === 1
        && trims[0]![0] === 0
        && trims[0]![1] === videoRootContext.video.value.duration
      )
        return

      // https://superuser.com/questions/681885/how-can-i-remove-multiple-segments-from-a-video-using-ffmpeg/1498811#1498811

      const noAudio = encoderOptions.value.noAudio
      const trimCount = trims.length

      const vArgs = parsedArgsVideoFilter.value.length
        ? `,${parsedArgsVideoFilter.value.join(',')}`
        : ''

      const aArgs = parsedArgsAudioFilter.value.length
        ? `,${parsedArgsAudioFilter.value.join(',')}`
        : ''

      let segments = ''
      let concatInputs = ''

      trims.forEach((trim, index) => {
        const [start, end] = trim

        segments += `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,format=yuv420p${vArgs}[${index}v];`
        concatInputs += `[${index}v]`

        if (!noAudio) {
          segments += `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS${aArgs}[${index}a];`
          concatInputs += `[${index}a]`
        }
      })

      segments += `${concatInputs}concat=n=${trimCount}:v=1:a=${noAudio ? 0 : 1}[outv]${noAudio ? '' : '[outa]'}`

      const r = [segments, '-map', '[outv]']

      if (!noAudio) {
        r.push('-map', '[outa]')
      }

      return r
    }),
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
    <AppSuspense>
      <VideoInfo :path="path" />
    </AppSuspense>

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
          <ol class="text-xs font-medium divide-y divide-default ring ring-default rounded-md">
            <li
              v-for="([key, value]) in Object.entries(argsValidFiltered)"
              :key="key"
              class="flex items-center gap-4 justify-between *:truncate p-2"
            >
              <UTooltip :text="value.toString()">
                <p class="truncate">
                  <span class="text-dimmed">{{ key }}: </span>
                  {{ Array.isArray(value) ? value.join(' ') : value }}
                </p>
              </UTooltip>

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

    <VideoEncoderHelp :encoder="encoderOptions.encoder" />

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
        :help="videoRootContext.videoInfo.value.fps && encoderOptions.fps && encoderOptions.fps > videoRootContext.videoInfo.value.fps ? `${encoderOptions.fps} fps exceeds the source ${videoRootContext.videoInfo.value.fps} fps; output size may be unpredictable.` : undefined"
      >
        <div class="flex items-center gap-2">
          <USelect
            v-model="encoderOptions.fps"
            :items="[10, 20, 24, 30, 60, 90, 120, 144, 180, 240]"
            color="neutral"
            variant="soft"
            :disabled="exportType === 'image'"
            :placeholder="videoRootContext.videoInfo.value.fps?.toString()"
          />

          <UButton
            v-if="encoderOptions.fps"
            icon="i-lucide-x"
            variant="soft"
            square
            :ui="{ base: 'rounded' }"
            @click="encoderOptions.fps = undefined"
          />
        </div>
      </UFormField>

      <UFormField label="Resolution">
        <div class="flex items-center gap-2">
          <USelect
            v-model="encoderOptions.resolution"
            :items="resolutions"
            color="neutral"
            variant="soft"
            :placeholder="videoRootContext.videoInfo.value.resolution"
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

      <UFormField
        label="Extra Arguments"
        :help="bitrateArgParsed && bitrateArgParsed > targetBitrate ? `Setting -b:v above ${Math.round(targetBitrate)}k may result in a file size over ${encoderOptions.fileSizeMb} MB.` : undefined"
      >
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
