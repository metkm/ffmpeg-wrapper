<script setup lang="ts">
import { appLocalDataDir } from '@tauri-apps/api/path'
import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window'
import { save } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { useFFmpeg } from '~/hooks/useFFmpeg'
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

const { spawn, stop, stdoutLines, running, progress } = useFFmpeg()

const args = ref<string[]>([])
const targetFileSize = ref(10)
const twoPass = ref(false)

const savePath = ref<string | null>()

const progressPercent = ref(0)
const eta = ref(0)

const targetBitrate = computed(() => targetFileSize.value * 8192 / (props.video.range[1] - props.video.range[0]) - 196)
const duration = computed(() => props.video.range[1] - props.video.range[0])

const onLine = () => {
  const time = progress.value?.time
  const speed = progress.value?.speed

  if (!time) return

  const seconds = formatTimeToSeconds(time)

  if (speed) {
    eta.value = (duration.value - seconds) / speed
  }

  progressPercent.value = parseInt((seconds * 100 / duration.value).toFixed(0))

  getCurrentWindow()
    .setProgressBar({
      status: ProgressBarStatus.Normal,
      progress: progressPercent.value,
    })

  // if (!line.startsWith('frame')) return

  // const matches: Record<string, string> = {}
  // let match: RegExpExecArray | null = null

  // while ((match = regex.exec(line)) !== null) {
  //   if (!match.groups) break

  //   const { name, value } = match.groups
  //   if (!name || !value) break

  //   matches[name] = value
  // }

  // const time = matches['time']
  // const speed = matches['speed']?.slice(0, -1)

  // if (time) {
  //   const seconds = formatTimeToSeconds(time)

  //   if (speed) {
  //     const secondsElapsed = duration.value - seconds
  //     eta.value = secondsElapsed / parseFloat(speed)
  //   }

  //   progress.value = parseInt((seconds * 100 / duration.value).toFixed(0))

  //   getCurrentWindow()
  //     .setProgressBar({
  //       status: ProgressBarStatus.Normal,
  //       progress: progress.value,
  //     })
  // }
}

const exportVideo = async () => {
  savePath.value = await save({
    filters: [
      {
        name: 'output',
        extensions: ['mp4'],
      },
    ],
  })

  if (!savePath.value) return

  const appdataLocal = await appLocalDataDir()

  const baseArgs = [
    '-y',
    '-ss', formatSeconds(props.video.range[0] || 0),
    '-to', formatSeconds(props.video.range[1] || 1),
    '-i', props.videoPath,
    '-passlogfile', `${appdataLocal}\\ffmpeg2pass.log`,
    '-vcodec', props.encoder,
    // '-b:v', `${targetBitrate.value}k`,
    '-maxrate', `${targetBitrate.value}k`,
    '-bufsize', `${targetBitrate.value / 2}k`,
    ...args.value,
  ]

  if (props.encoder === 'av1_nvenc') {
    baseArgs.push('-rc', 'vbr')
  }

  if (props.encoder === 'av1_nvenc' && twoPass.value) {
    await spawn([...baseArgs, '-an', '-pass', '1', '-f', 'mp4', 'NUL'], onLine)
    baseArgs.push('-pass', '2')
  }

  await spawn([...baseArgs, savePath.value], onLine)

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
          description="analyze video twice for better compression (might be useful for av1 encoders)"
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

        <UButton
          v-if="savePath"
          icon="i-lucide-folder-symlink"
          variant="link"
          color="neutral"
          @click="revealItemInDir(savePath)"
        >
          {{ savePath }}
        </UButton>
      </div>
    </div>

    <template v-if="stdoutLines.length > 0">
      <pre
        ref="stdoutElement"
        class="flex flex-col-reverse text-xs max-h-96 w-full overflow-x-hidden overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius) scrollbar"
        style="overflow-wrap: break-word;"
      >{{ stdoutLines.join('\n') }}</pre>

      <div>
        <UProgress
          v-model="progressPercent"
          status
        />

        <p
          v-if="eta > 0"
          class="text-muted text-sm mt-1 font-medium"
        >
          {{ eta.toFixed(0) }}s left
        </p>
      </div>
    </template>
  </div>
</template>
