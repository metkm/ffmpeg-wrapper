<script setup lang="ts">
definePageMeta({
  name: 'upload',
})

const videoPath = ref<string>('')

const onSelect = async () => {
  await navigateTo({
    name: 'export',
    query: {
      path: videoPath.value,
    },
  })
}
</script>

<template>
  <div class="flex flex-col grow gap-4 relative justify-center">
    <FolderHistory class="border border-muted/50 border-dashed p-4 rounded-(--ui-radius)" />

    <FileDrop
      v-model="videoPath"
      class="border border-muted/50 border-dashed aspect-video w-full"
      @select="onSelect"
    />

    <AppUpdate />

    <!-- <AppDockContainer class="flex items-center p-2 gap-2">
      <FileHistory :disabled="isUpdating" />
      <AppColorMode />
    </AppDockContainer> -->

    <!-- <LayoutGroup>
      <AnimatePresence>
        <Motion layout as-child>
          <FileDrop v-model="videoPath" class="grow rounded-none" :disabled="isUpdating" @select="onSelect" />
        </Motion>

        <motion.div v-if="isUpdating" layout :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }">
          <p class="text-muted text-sm font-medium p-2">
            Installing update ({{ progress.toFixed(0) }}%)
          </p>

          <div class="h-1 w-full bg-muted">
            <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
          </div>
        </motion.div>
      </AnimatePresence>
    </LayoutGroup> -->
  </div>
</template>
