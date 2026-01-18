<script setup lang="ts">
definePageMeta({
  name: 'upload',
})

const isUpdating = ref(false)
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
  <div class="flex flex-col grow gap-2 relative justify-center">
    <FolderHistory />

    <FileDrop
      v-model="videoPath"
      class="aspect-video w-full"
      :disabled="isUpdating"
      @select="onSelect"
    />

    <AppUpdate
      v-model="isUpdating"
      class="fixed bottom-0 inset-x-0"
    />

    <AppDockContainer>
      <AppColorMode />
    </AppDockContainer>

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
