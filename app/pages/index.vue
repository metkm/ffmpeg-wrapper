<script setup lang="ts">
definePageMeta({
  name: 'upload',
})

const videoPath = ref<string>('')

const onDrop = () => {
  navigateTo({
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
    @drop="onDrop"
  />
</template>
