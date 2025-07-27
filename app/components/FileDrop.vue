<script setup lang="ts">
import type { UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { open } from '@tauri-apps/plugin-dialog'

const path = defineModel<string>()
const hovering = ref(false)

const openFile = async () => {
  path.value = await open({
    multiple: false,
    directory: false,
  }) ?? undefined
}

let unlistenFn: UnlistenFn

onMounted(async () => {
  unlistenFn = await getCurrentWebview()
    .onDragDropEvent((event) => {
      if (event.payload.type === 'over') {
        hovering.value = true
      } else if (event.payload.type === 'leave') {
        hovering.value = false
      } else if (event.payload.type === 'drop') {
        path.value = event.payload.paths.at(0)
      }
    })
})

onUnmounted(() => unlistenFn())
</script>

<template>
  <div
    class="flex-1 flex flex-col items-center justify-center gap-2 rounded-(--ui-radius) transition-colors"
    :class="{ 'bg-elevated/50': hovering }"
  >
    <span class="bg-elevated size-10 shrink-0 flex items-center justify-center rounded-full">
      <UIcon
        name="i-lucide-upload"
        class="text-muted"
      />
    </span>

    <UButton
      variant="soft"
      color="neutral"
      @click="openFile"
    >
      Select File
    </UButton>
  </div>
</template>
