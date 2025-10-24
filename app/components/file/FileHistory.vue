<script setup lang="ts">
const { pathHistory } = usePathsStore()

const folders = computed(() => {
  const foldersWithoutDuplicates: string[] = []

  for (let index = 0; index < pathHistory.length; index++) {
    const element = pathHistory[index]
    if (!element)
      return

    const folderPath = element.path
      .split('\\')
      .slice(0, -1)
      .join('\\')

    if (foldersWithoutDuplicates.find(path => folderPath === path))
      continue

    foldersWithoutDuplicates.push(folderPath)
  }

  foldersWithoutDuplicates.reverse()
  return foldersWithoutDuplicates
})
</script>

<template>
  <UDrawer
    title="Recently used folders & contents inside them"
    :ui="{
      body: 'overflow-y-auto relative scrollbar space-y-4',
      container: 'p-0',
      title: 'ml-4',
    }"
  >
    <UButton
      icon="i-lucide-chevron-up"
      class="self-center"
      variant="soft"
    >
      Recently Used Folders
    </UButton>

    <template #body>
      <FolderContent
        v-for="folder in folders"
        :key="folder"
        :path="folder"
      />
    </template>
  </UDrawer>
</template>
