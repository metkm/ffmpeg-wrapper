<script setup lang="ts">
const { pathHistory } = usePathsStore()

const folders = computed(() => {
  const foldersWithoutDuplicates: string[] = []

  for (let index = 0; index < pathHistory.length; index++) {
    const element = pathHistory[index]
    if (!element)
      continue

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
  <div class="flex flex-col gap-2">
    <div
      v-if="folders.length > 0"
      class="flex flex-col gap-2 rounded-lg"
    >
      <h1 class="text-highlighted font-medium">
        Recently Used Folders
      </h1>

      <ol class="flex flex-wrap gap-2">
        <li
          v-for="folder in folders"
          :key="folder"
        >
          <FolderItem
            :path="folder"
            class="ring ring-default"
          />
        </li>
      </ol>
    </div>
    <UEmpty
      v-else
      title="Recently Used Folders"
      description="Last used folders will appear here when you open some videos"
    />
  </div>
</template>
