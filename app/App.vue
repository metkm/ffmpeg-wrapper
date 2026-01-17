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

        <template #fallback>
          <div class="h-8" />
        </template>
      </Suspense>

      <main class="flex flex-col grow py-4 *:max-w-4xl *:w-full *:mx-auto overflow-y-auto relative scrollbar-gutter">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<style>
::-webkit-scrollbar {
  width: 14px;
}

::-webkit-scrollbar-thumb {
  border: 4px solid var(--ui-bg);
  background-clip: padding-box;
  border-radius: 9999px;
  background-color: var(--ui-bg-elevated);
}
</style>
