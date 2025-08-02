<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { check } from '@tauri-apps/plugin-updater'

const toast = useToast()
const crop = ref({
  top: 0,
  left: 0,
  width: 0,
  right: 0,
})

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
        <AppWindowOverlay />
      </Suspense>

      <!-- <main class="flex flex-col grow overflow-x-hidden overflow-y-auto scrollbar">
        <NuxtPage />
      </main> -->

      <VideoCrop
        v-model="crop"
        :width="1532"
        :height="2048"
      />

      <p class="bg-red-500 fixed bottom-0 right-0">
        {{ crop }}
      </p>
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
