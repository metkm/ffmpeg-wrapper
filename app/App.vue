<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
// import { listen } from '@tauri-apps/api/event'

onMounted(async () => {
  /* @ts-expect-error This argument can be given by rust side when right click open with is used */
  const file = window.openedFile as undefined | string

  if (file) {
    await navigateTo({
      name: 'export',
      query: {
        path: file,
      },
    })
  }

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
          <div class="h-titlebar-height" />
        </template>
      </Suspense>

      <main class="h-full w-full min-h-0 min-w-0 relative *:p-2">
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
