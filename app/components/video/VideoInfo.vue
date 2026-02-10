<script setup lang="ts">
import { basename } from '@tauri-apps/api/path'
import { useCommand } from '~/hooks/useCommand'

const props = defineProps<{
  path: string
}>()

const info = ref<Record<string, string>>({})

// example
// Stream #0:0: Video: av1 (Main) (av01 / 0x31307661), yuv420p(tv, bt709, progressive), 3840x2160 [SAR 1:1 DAR 16:9], q=2-31, 2000 kb/s, 60 fps, 15360 tbn (default)
const regex = /Video: (?<codec>\w+).*?\((?<decoder>\w+)\s\/.*?\s(?<resolution>\d+x\d+)\s.*?(?<fps>\d+[.]*\d+\sfps)/
const regexBitrate = /bitrate:\s(?<bitrate>\d+\skb\/s)/

const { spawn } = useCommand({
  onLine: (line) => {
    const match = line.match(regex)
    const matchBitrate = line.match(regexBitrate)

    if (matchBitrate && matchBitrate.groups && matchBitrate.groups.bitrate) {
      info.value['bitrate'] = matchBitrate.groups.bitrate
    }

    if (!match || !match.groups) {
      return
    }

    info.value = {
      ...match.groups,
      ...info.value,
    }
  },
})

spawn('binaries/ffmpeg', ['-i', props.path])
const name = await basename(props.path)
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
      {{ name }}
    </UButton>

    <template
      v-if="info"
      #content
    >
      <ul class="text-xs font-medium mt-2 m-0.5">
        <li
          v-for="[key, value] in Object.entries(info)"
          :key="key"
        >
          <span class="capitalize text-dimmed">{{ key }}: </span>
          {{ value }}
        </li>
      </ul>
    </template>
  </UCollapsible>
</template>
