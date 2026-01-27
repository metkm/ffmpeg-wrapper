<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

onMounted(() => {
  getCurrentWindow()
    .show()
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen w-screen overflow-hidden">
      <Suspense>
        <AppWindowOverlay />

        <template #fallback>
          <div class="h-8" />
        </template>
      </Suspense>

      <main class="grow relative overflow-hidden">
        <!-- <main class="flex flex-col grow *:@container *:w-full *:mx-auto relative"> -->
        <!-- <main class="flex flex-col grow p-2 *:@container *:w-full *:mx-auto overflow-y-auto relative"> -->
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
