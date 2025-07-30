<script setup lang="ts">
import { appLocalDataDir } from '@tauri-apps/api/path'
import { save } from '@tauri-apps/plugin-dialog'
import { useFfmpeg } from '~/hooks/useFfmpeg'
import type { Encoder } from '~/types/parameters'
import type { Video } from '~/types/video'

const props = defineProps<{
  encoder: Encoder
  video: Video
  videoPath: string
}>()

const emit = defineEmits<{
  exportEnd: []
}>()

const args = ref<string[]>([])

const { spawn, stop, stdoutLines, running } = useFfmpeg()

const targetFileSize = ref(10)
const twoPass = ref(true)

const targetBitrate = computed(() => targetFileSize.value * 8192 / (props.video.range[1] - props.video.range[0]) - 196)

const exportVideo = async () => {
  const savePath = await save({
    filters: [
      {
        name: 'output',
        extensions: ['mp4'],
      },
    ],
  })

  if (!savePath) return

  const appdataLocal = await appLocalDataDir()

  const baseArgs = [
    '-y',
    '-ss', formatSeconds(props.video.range[0] || 0),
    '-to', formatSeconds(props.video.range[1] || 1),
    '-i', props.videoPath,
    '-passlogfile', `${appdataLocal}\\ffmpeg2pass.log`,
    '-vcodec', props.encoder,
    '-b:v', `${targetBitrate.value}k`,
    ...args.value,
  ]

  if (props.encoder === 'av1_nvenc') {
    baseArgs.push('-rc', 'vbr')
  }

  if (props.encoder === 'av1_nvenc' && twoPass.value) {
    await spawn([...baseArgs, '-an', '-pass', '1', '-f', 'mp4', 'NUL'])
    baseArgs.push('-pass', '2')
  }

  await spawn([...baseArgs, savePath])

  emit('exportEnd')
}
</script>

<template>
  <div class="space-y-4 p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <div class="flex flex-col gap-4 justify-between w-full">
      <div class="flex flex-wrap gap-4 *:grow">
        <slot />

        <CommandParameters
          v-model="args"
          :encoder="encoder"
        />

        <UFormField
          label="target file size"
          :description="`${targetBitrate.toFixed(0)} bitrate`"
          class="capitalize"
        >
          <UInputNumber
            v-model="targetFileSize"
            :min="0"
            variant="soft"
            color="neutral"
            class="w-full after:content-['(MB)'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:pl-18 after:font-medium after:text-muted after:pointer-events-none"
          />
        </UFormField>

        <UCheckbox
          v-model="twoPass"
          label="Two pass"
          variant="card"
          description="analyze video twice for better compression"
        />
      </div>

      <div class="flex items-center gap-4">
        <UButton
          v-if="running"
          icon="i-lucide-circle-stop"
          color="warning"
          variant="subtle"
          @click="stop"
        >
          Stop
        </UButton>

        <UButton
          icon="i-lucide-folder-down"
          :loading="running"
          @click="exportVideo"
        >
          Export
        </UButton>
      </div>
    </div>

    <pre
      v-if="stdoutLines.length > 0"
      ref="stdoutElement"
      class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
      style="overflow-wrap: break-word;"
    >{{ stdoutLines.join('\n') }}</pre>
  </div>
</template>
