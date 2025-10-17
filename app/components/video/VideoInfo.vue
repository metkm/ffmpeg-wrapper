<script setup lang="ts">
import { Command } from '@tauri-apps/plugin-shell'
import type { VideoInfo } from '~/types/video'

const props = defineProps<{
  path: string
}>()

const infoRef = ref<VideoInfo>({})
const info: VideoInfo = {}

const command = Command.sidecar('binaries/ffmpeg', ['-i', props.path])

command.stderr.addListener('data', (_line) => {
  const line = _line.trim()

  if (line.startsWith('creation_time')) {
    const ds = line.split(': ').at(-1)?.trim()

    if (ds) {
      const d = new Date(ds)
      info.creationTime = d.toLocaleString()
    }
  } else if (line.startsWith('Stream #0:0')) {
    const l = line.split(',')

    const fps = l.at(6)?.trim()
    const resolution = l.at(4)?.split('[').at(0)?.trim()
    const codec = l.at(0)?.split('Video:').at(1)?.trim().split(' ').at(0)

    info.fps = fps
    info.resolution = resolution
    info.videoCodec = codec
  } else if (line.startsWith('Stream #0:1')) {
    const l = line.split(',')

    const quality = l.at(4)
    const codec = l.at(0)?.split('Audio:').at(1)?.trim().split(' ').at(0)

    info.audioQuality = quality
    info.audioCodec = codec
  }
})

command.addListener('close', () => {
  infoRef.value = info
})

command.spawn()
</script>

<template>
  <UCollapsible class="flex flex-col">
    <UButton
      variant="ghost"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
        base: 'rounded',
      }"
      size="xl"
      block
    >
      <div class="flex flex-col items-start">
        <p>
          {{ path.split('\\').at(-1) }}
        </p>

        <span class="text-sm text-muted">
          Press <UKbd>C</UKbd> to toggle crop
        </span>
      </div>
    </UButton>

    <template #content>
      <ul class="p-4 rounded bg-elevated muted text-sm mt-4">
        <li
          v-for="[key, value] in Object.entries(infoRef)"
          :key="key"
        >
          <span class="capitalize text-dimmed">{{ key }}: </span>
          {{ value }}
        </li>
      </ul>
    </template>
  </UCollapsible>
</template>
