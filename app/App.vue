<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

onMounted(() => {
  getCurrentWindow()
    .show()
})
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-x-hidden">
    <Suspense>
      <AppWindowOverlay />
    </Suspense>

    <main class="flex flex-col grow overflow-x-hidden overflow-y-auto py-4 scrollbar">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
.scrollbar::-webkit-scrollbar {
  display: block;
  width: calc(var(--spacing) * 3.5);
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--ui-bg-accented);
  border-radius: var(--radius-4xl);
  background-clip: padding-box;
  border: 3px solid transparent;
}

.scrollbar::-webkit-scrollbar-corner {
  display: none;
}

.scrollbar::-webkit-scrollbar:horizontal {
  display: none;
}

.scrollbar {
  scrollbar-gutter: stable both-edges;
}

.page-enter-active,
.page-leave-active {
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
  transition-property: all;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
