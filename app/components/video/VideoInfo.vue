<script setup lang="ts">
import { useCommand } from '~/hooks/useCommand'

const props = defineProps<{
  path: string
}>()

const info = ref<Record<string, string>>()

const regex = /Video: (?<codec>\w+)\s\((?<decoder>\w+)\).*?(?<resolution>\d+x\d+).*?(?<fps>\d+\sfps)/

const { spawn } = useCommand({
  onLine: (line) => {
    const match = line.match(regex)
    if (!match) {
      return
    }

    info.value = match.groups
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
