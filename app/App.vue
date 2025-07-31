<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { check } from '@tauri-apps/plugin-updater'

const toast = useToast()

onMounted(() => {
  getCurrentWindow()
    .show()
})

onMounted(async () => {
  const update = await check()
  if (!update) return

  await update.downloadAndInstall(({ event }) => {
    if (event === 'Started') {
      toast.add({
        title: 'Update found',
        description: 'App will be automatically restarted when update is completed',
      })
    }
  })
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen w-screen overflow-x-hidden">
      <Suspense>
        <WindowOverlay />
      </Suspense>

      <main class="overflow-x-hidden overflow-y-auto scrollbar">
        <NuxtPage />
      </main>
    </div>
  </UApp>
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
</style>
