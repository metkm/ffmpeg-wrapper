<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const { pathHistory } = usePathsStore()

const selectedFolder = ref()

const selectedFolderShownTitle = computed(() => selectedFolder.value?.split('\\').slice(3).join('\\'))

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
  <USlideover
    side="left"
    :ui="{
      body: 'scrollbar sm:p-3',
      wrapper: 'flex-1 overflow-hidden',
      title: 'truncate mx-10 text-sm text-center',
    }"
    :title="selectedFolderShownTitle"
  >
    <UButton
      icon="i-lucide-folder"
      class="self-center"
      variant="soft"
      v-bind="$attrs"
    >
      Open Recently Used Folders
    </UButton>

    <template #body>
      <ol
        v-if="!selectedFolder"
        class="grid grid-cols-2"
      >
        <li
          v-for="folder in folders"
          :key="folder"
          class="flex flex-col p-2 hover:bg-muted rounded-(--ui-radius) self-center"
        >
          <button @click="selectedFolder = folder">
            <UIcon
              name="i-lucide-folder"
              class=" h-20 w-full"
            />

            <p class="truncate text-sm">
              {{ folder.split('\\').slice(-2).join('\\') }}
            </p>
          </button>
        </li>
      </ol>
      <FolderContent
        v-else
        :path="selectedFolder"
      />
    </template>

    <template
      v-if="selectedFolder"
      #actions
    >
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        square
        class="absolute left-4 top-4"
        @click="selectedFolder = undefined"
      />
    </template>
  </USlideover>
</template>
