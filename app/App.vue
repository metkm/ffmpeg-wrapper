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
const videoRange = ref<[number, number]>([0, 1])
const stdoutLines = ref<string[]>([])
const exporting = ref(false)

const video = ref<VideoValues>(defaultVideoValues)

const prestdoutElement = useTemplateRef('stdoutElement')

let command: Command<string> | undefined
let commandChild: Child | undefined

const onCommandStdoutData = (arg: string) => {
  const line = arg.trim()
  stdoutLines.value.push(line)

  prestdoutElement.value?.scrollTo({ top: prestdoutElement.value.scrollHeight, behavior: 'smooth' })
}

const onCommandClose = () => {
  videoPath.value = ''
  videoRange.value = [0, 1]
  stdoutLines.value = []
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
    <main class="flex p-4 min-h-screen space-y-8">
      <FileDrop
        v-if="!videoPath"
        v-model="videoPath"
        class="grow"
      />

      <div
        v-else
        class="flex flex-col gap-8 max-w-4xl mx-auto"
      >
        <VideoPreview
          v-if="videoUrl"
          v-model="video"
          v-model:range="videoRange"
          :url="videoUrl"
        />

        <VideoOptions
          :loading="exporting"
          @cancel="videoPath = ''"
          @export="exportVideo"
        />

        <pre
          ref="stdoutElement"
          class="text-xs overflow-auto max-h-96 max-w-full border border-dashed border-muted p-4 rounded-(--ui-radius)"
          style="overflow-wrap: break-word;"
        >
          {{ stdoutLines.join('\n') }}
        </pre>
      </div>
    </main>
  </UApp>
</template>
