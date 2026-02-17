<script setup lang="ts">
import { basename } from '@tauri-apps/api/path'
import { useCommand } from '~/hooks/useCommand'
import { injectVideoRootContext } from './VideoRoot.vue'

const props = defineProps<{
  path: string
}>()

const videoRootContext = injectVideoRootContext()
// const info = ref<Record<string, string>>({})

// example
// Video: av1 (Main) (av01 / 0x31307661), yuv420p(tv, bt709, progressive), 3840x2160 [SAR 1:1 DAR 16:9], q=2-31, 2000 kb/s, 60 fps, 15360 tbn (default)
// Video: av1 (libdav1d) (Main) (av01 / 0x31307661), yuv420p(tv, bt709, progressive), 1920x1080, 2262 kb/s, SAR 1:1 DAR 16:9, 60 fps, 60 tbr, 15360 tbn, start 0.016016 (default)
// Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709, progressive), 1920x1080 [SAR 1:1 DAR 16:9], 19169 kb/s, 119.99 fps, 120 tbr, 90k tbn (default)

const regex = /Video: (?<codec>\w+).*(\((?<decoder>\w+) \/ \w+\)).*?(?<resolution>\d+x\d+).*(?:\s(?<fps>\d+[.]*\d+)\sfps)/
const regexBitrate = /bitrate:\s(?<bitrate>\d+\skb\/s)/

const { spawn } = useCommand({
  onLine: (line) => {
    const match = line.match(regex)
    const matchBitrate = line.match(regexBitrate)

    if (match?.groups) {
      videoRootContext.videoInfo.value.codec = match.groups.codec
      videoRootContext.videoInfo.value.decoder = match.groups.decoder
      videoRootContext.videoInfo.value.fps = match.groups.fps ? parseFloat(match.groups.fps) : undefined
      videoRootContext.videoInfo.value.resolution = match.groups.resolution as `${number}x${number}` | undefined
    }

    if (matchBitrate?.groups) {
      videoRootContext.videoInfo.value.bitrate = matchBitrate.groups.bitrate
    }
  },
})

spawn('binaries/ffmpeg', ['-i', props.path])
videoRootContext.videoInfo.value.name = await basename(props.path)
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
      {{ videoRootContext.videoInfo.value.name }}
    </UButton>

    <template #content>
      <ul class="text-xs font-medium mt-2 m-0.5">
        <li
          v-for="[key, value] in Object.entries(videoRootContext.videoInfo.value)"
          :key="key"
        >
          <span class="capitalize text-dimmed">{{ key }}: </span>
          {{ value }}
        </li>
      </ul>
    </template>
  </UCollapsible>
</template>
