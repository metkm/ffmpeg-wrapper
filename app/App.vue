<script setup lang="ts">
import { save } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import type { Child } from '@tauri-apps/plugin-shell'
import { Command } from '@tauri-apps/plugin-shell'
import { ref } from 'vue'
import type { VideoValues } from './types/video'
import { defaultVideoValues } from './constants'
import { getCurrentWindow } from '@tauri-apps/api/window'

const videoPath = ref<string>('')
const stdoutLines = ref<string[]>([])

const exporting = ref(false)
const exportEta = ref(0)

const video = ref<VideoValues>(defaultVideoValues)

const prestdoutElement = useTemplateRef('stdoutElement')

let command: Command<string> | undefined
let commandChild: Child | undefined

const onCommandStdoutData = (arg: string) => {
  const line = arg.trim()
  stdoutLines.value.push(line)

  if (line.includes('speed')) {
    const speed = line.split('speed=').at(1)?.slice(0, -1)
    if (!speed) return

    const speedParsed = parseFloat(speed)

    let durationLeft = (video.value.range[1] || 0) - (video.value.range[0] || 1)

    if (line.includes('time')) {
      const time = line.split('time=').at(1)?.slice(0, 8).split(':')
      if (!time) return

      const [hours, minutes, seconds] = time
      const hoursParsed = hours ? parseInt(hours) : 0
      const minutesParsed = minutes ? parseInt(minutes) : 0
      const secondsParsed = seconds ? parseInt(seconds) : 0

      const elapsed = hoursParsed * 3600 + minutesParsed * 60 + secondsParsed
      durationLeft -= elapsed
    }

    exportEta.value = durationLeft / speedParsed
  }

  prestdoutElement.value?.scrollTo({ top: prestdoutElement.value.scrollHeight, behavior: 'smooth' })
}

const onCommandClose = () => {
  videoPath.value = ''
  stdoutLines.value = []

  exportEta.value = 0
  exporting.value = false

  video.value = defaultVideoValues

  command?.removeAllListeners()
  commandChild?.kill()

  command = undefined
  commandChild = undefined
}

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

  exporting.value = true
  command = Command.sidecar('binaries/ffmpeg', [
    '-y',
    '-i',
    videoPath.value,
    '-crf',
    video.value.crf.toString(),
    '-ss',
    formatSeconds(video.value.range[0] || 0),
    '-to',
    formatSeconds(video.value.range[1] || 1),
    savePath,
  ])

  command.stdout.on('data', onCommandStdoutData)
  command.stderr.on('data', onCommandStdoutData)

  command.once('close', onCommandClose)

  commandChild = await command.spawn()
}

const videoUrl = computed(() => videoPath.value ? convertFileSrc(videoPath.value) : undefined)

onUnmounted(() => onCommandClose())

onMounted(() => {
  getCurrentWindow()
    .show()
})
</script>

<template>
  <UApp>
    <main class="flex p-4 min-h-screen overflow-x-hidden space-y-8">
      <FileDrop
        v-if="!videoPath"
        v-model="videoPath"
        class="grow"
      />

      <div
        v-else
        class="flex flex-col gap-8 max-w-4xl h-full w-full mx-auto"
      >
        <VideoPreview
          v-if="videoUrl"
          v-model="video"
          :url="videoUrl"
        />

        <VideoOptions
          :loading="exporting"
          @cancel="onCommandClose"
          @export="exportVideo"
        />

        <div class="w-full">
          <p
            v-if="exportEta > 0"
            class="font-medium text-sm text-muted p-2 pt-0 px-1"
          >
            {{ exportEta.toFixed(0) }} seconds left
          </p>

          <pre
            ref="stdoutElement"
            class="text-xs max-h-96 w-full overflow-auto border border-dashed border-muted p-4 rounded-(--ui-radius)"
            style="overflow-wrap: break-word;"
          >
          {{ stdoutLines.join('\n') }}
        </pre>
        </div>
      </div>
    </main>
  </UApp>
</template>
