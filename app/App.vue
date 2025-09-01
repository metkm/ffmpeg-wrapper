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

    <main class="relative flex flex-col grow p-4 overflow-x-hidden overflow-y-auto scrollbar">
      <AppColorMode class="right-4 top-4 absolute" />
      <NuxtPage />
    </main>
  </div>
</template>

<style>
.scrollbar::-webkit-scrollbar {
  display: none;
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
