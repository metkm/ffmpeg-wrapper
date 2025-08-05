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
  <FileDrop
    v-model="videoPath"
    class="grow -mx-4"
    @select="onSelect"
  />
</template>
