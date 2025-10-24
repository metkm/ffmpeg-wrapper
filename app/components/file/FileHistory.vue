<script setup lang="ts">
const { pathHistory } = usePathsStore()

const folders = computed(() => {
  return pathHistory.map((history) => {
    return history.path
      .split('\\')
      .slice(0, -1)
      .join('\\')
  })
})
</script>

<template>
  <section class="flex justify-center fixed bottom-0 left-0 right-0 p-4">
    <UDrawer :ui="{ body: 'overflow-y-auto relative scrollbar space-y-4' }">
      <UButton
        icon="i-lucide-chevron-up"
        square
        class="self-center"
        size="lg"
      />

      <template #body>
        <FolderContent
          v-for="folder in folders"
          :key="folder"
          :path="folder"
        />
      </template>
    </UDrawer>
  </section>
</template>
