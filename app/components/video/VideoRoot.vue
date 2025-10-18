<script lang="ts">
import { createContext } from 'motion-v'
import type { ShallowRef } from 'vue'

export interface VideoRootContext {
  videoElement: ShallowRef<HTMLVideoElement | null>
}

export const [injectVideoRootContext, provideVideoRootContext] = createContext<VideoRootContext>('VideoRoot')
</script>

<script setup lang="ts">
const videoElement = shallowRef<HTMLVideoElement | null>(null)

provideVideoRootContext({
  videoElement,
})
</script>

<template>
  <slot />
</template>
