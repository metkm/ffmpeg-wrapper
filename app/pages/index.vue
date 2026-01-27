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
    <FolderHistory class="max-w-7xl mx-auto w-full" />

    <FileDrop
      v-model="videoPath"
      class="grow"
      :disabled="isUpdating"
      @select="onSelect"
    />

    <AppUpdate
      v-model="isUpdating"
      class="fixed bottom-0 inset-x-0"
    />
  </div>
</template>
