<script setup lang="ts">
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

const { spawn, stdoutLines, running } = useFfmpeg()

const targetFileSize = ref(10)
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

  const baseArgs = [
    '-y',
    '-i',
    props.videoPath,
    '-vcodec',
    props.encoder,
    ...args.value,
    '-ss',
    formatSeconds(props.video.range[0] || 0),
    '-to',
    formatSeconds(props.video.range[1] || 1),
  ]

  if (props.encoder === 'av1_nvenc') {
    baseArgs.push('-rc', 'cbr')

    await spawn([...baseArgs, '-pass', '1', '-f', 'mp4', 'NUL'])
    baseArgs.push('-pass', '2')
  }

  await spawn([...baseArgs, '-b:v', `${targetBitrate.value}k`, savePath])
  emit('exportEnd')
}
</script>

<template>
  <div class="space-y-4 p-4 rounded-(--ui-radius) border border-dashed border-muted z-50">
    <div class="flex justify-between w-full">
      <div class="flex gap-4 items-end">
        <CommandParameters
          v-model="args"
          :encoder="encoder"
        />

        <UFormField
          label="target file size"
          :description="`${targetBitrate.toFixed(0)} bitrate`"
        >
          <UInputNumber
            v-model="targetFileSize"
            :min="0"
            variant="soft"
            color="neutral"
          />
        </UFormField>
      </div>

      <UButton
        icon="i-lucide-folder-down"
        :loading="running"
        @click="exportVideo"
      >
        Export
      </UButton>
    </div>

    <pre
      v-if="stdoutLines.length > 0"
      ref="stdoutElement"
      class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
      style="overflow-wrap: break-word;"
    >{{ stdoutLines.join('\n') }}</pre>
  </div>
</template>
