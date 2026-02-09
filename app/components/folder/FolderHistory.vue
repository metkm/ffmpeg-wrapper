<script setup lang="ts">
const { folderHistorySorted } = usePathsStore()
</script>

<template>
  <div class="flex flex-col gap-2">
    <UPageCard
      v-if="folderHistorySorted.length > 0"
      title="Recently used folders"
      description="The folder the opened video is in will show up here"
      variant="soft"
    >
      <ol class="flex flex-wrap gap-2">
        <li
          v-for="folder in folderHistorySorted"
          :key="folder.path"
        >
          <AppSuspense>
            <FolderItem
              :path="folder.path"
              class="ring ring-default"
              variant="soft"
            />
          </AppSuspense>
        </li>
      </ol>
    </UPageCard>
    <UEmpty
      v-else
      title="Recently Used Folders"
      description="Last used folders will appear here when you open some videos"
    />
  </div>
</template>
