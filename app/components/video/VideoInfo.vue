<script setup lang="ts">
import { useCommand } from '~/hooks/useCommand'
import type { VideoInfo } from '~/types/video'

const props = defineProps<{
  path: string
}>()

const infoRef = ref<VideoInfo>({})
const info: VideoInfo = {}

const { spawn } = useCommand({
  onLine: (_line) => {
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
  },
  onClose: () => {
    infoRef.value = info
  },
})

await spawn('binaries/ffmpeg', ['-i', props.path])
</script>

<template>
  <UCollapsible class="group">
    <UButton
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform',
      }"
      block
      size="sm"
      variant="soft"
      class="text-left rounded-md"
    >
      {{ path.split('\\').at(-1) }}
    </UButton>

    <template #content>
      <ul class="text-xs font-medium mt-2 m-0.5">
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
