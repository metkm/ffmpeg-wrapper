<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

onMounted(() => {
  getCurrentWindow()
    .show()
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen w-screen overflow-x-hidden">
      <Suspense>
        <AppWindowOverlay />
      </Suspense>

      <main class="relative flex flex-col grow p-4 overflow-x-hidden overflow-y-auto scrollbar">
        <AppColorMode class="right-4 top-4 absolute" />
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<style>
.scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
