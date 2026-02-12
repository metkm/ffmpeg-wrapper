<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'

const props = defineProps<{
  path: string
}>()

const audioWave = await invoke<number[]>('get_audio_graph', {
  videoPath: props.path,
})

const canvas = useTemplateRef('audioGraphCanvas')

const width = 4000
const height = 200
const centerY = height / 2

const totalSamples = audioWave.length / 2 // divide by 2 because every num is 2 bytes, 16 bit
const samplesPerPixel = Math.floor(totalSamples / width)

onMounted(() => {
  if (!canvas.value)
    return

  const ctx = canvas.value.getContext('2d')
  if (!ctx)
    return

  ctx.fillStyle = getComputedStyle(canvas.value).getPropertyValue('--ui-bg-elevated')

  for (let x = 0; x < width; x++) {
    let max = 0

    for (let j = 0; j < samplesPerPixel; j++) {
      const i = (x * samplesPerPixel + j) * 2
      const val = audioWave[i]! | (audioWave[i + 1]! << 8)
      const signed = val > 0x7FFF ? val - 0x10000 : val

      const absVal = Math.abs(signed)
      if (absVal > max) {
        max = absVal
      }
    }

    const normalized = max / 32768
    const barHeight = normalized * height

    ctx.fillRect(
      x,
      centerY - barHeight / 2,
      1,
      barHeight,
    )
  }
})
</script>

<template>
  <canvas
    ref="audioGraphCanvas"
    :height="height"
    :width="width"
  />
</template>
