<script setup lang="ts">
import { appLocalDataDir } from '@tauri-apps/api/path'
import { save } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { parametersPerEncoders, videoFilters } from '~/constants'
import { useFFmpeg } from '~/hooks/useFFmpeg'
import type { Encoder } from '~/types/parameters'
import type { Video } from '~/types/video'

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
    '-passlogfile', `${await appLocalDataDir()}\\ffmpeg2pass.log`,
    '-vcodec', encoder.value,
    // '-b:v', `${targetBitrate.value}k`,
    '-maxrate', `${targetBitrate.value}k`,
    '-bufsize', `${targetBitrate.value / 2}k`,
    ...args.value,
  ]

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
  <section class="space-y-4">
    <div class="grid grid-cols-3 gap-4 rounded-(--ui-radius)">
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

    <div class="flex items-center justify-end gap-4 border border-dashed rounded-(--ui-radius) p-4 border-muted">
      <LayoutGroup>
        <AnimatePresence>
          <Motion layout>
            <UButton
              v-if="output.savePath"
              icon="i-lucide-folder-symlink"
              variant="link"
              color="neutral"
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
        </AnimatePresence>
      </LayoutGroup>

      <UButton
        icon="i-lucide-folder-down"
        :loading="processing"
        @click="process"
      >
        Export
      </UButton>
    </div>

    <template v-if="stdoutLines.length > 0">
      <pre
        ref="stdoutElement"
        class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
        style="overflow-wrap: break-word;"
      >{{ stdoutLines.join('\n') }}</pre>

      <div v-if="progress && processing">
        <UProgress v-model="progress.percent" />

        <p
          v-if="(progress.eta ?? 0) > 0"
          class="text-muted text-sm mt-1 font-medium"
        >
          {{ progress.percent }}% - {{ progress.eta?.toFixed(0) }}s left
        </p>
      </div>
    </template>
  </section>
</template>
