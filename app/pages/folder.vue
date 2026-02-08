<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { DirEntry } from '@tauri-apps/plugin-fs'

definePageMeta({
  middleware: (to) => {
    if (!to.query.path)
      return false

    return true
  },
})

const folderPath = useRouteQuery('path', '')

const entries = ref<DirEntry[]>(await getVideoEntries(folderPath.value))

const updateEntries = async () => {
  try {
    entries.value = await getVideoEntries(folderPath.value)
  } catch {
    await navigateTo('/')
  }
}

const items = computed(() => {
  return folderPath.value.split('\\')
    .map((item, index, array) => {
      const base = array.slice(0, index - array.length + 1).join('\\')

      return {
        label: `${item}`,
        to: { name: 'folder', query: { path: base } },
      }
    })
    .slice(1) as BreadcrumbItem[]
})

watch(folderPath, updateEntries)
</script>

<template>
  <div class="overflow-y-auto grow">
    <div class="flex flex-col gap-2 grow max-w-7xl w-full mx-auto @container">
      <div class="flex items-center justify-between gap-2 ring ring-default rounded-md p-2 mx-2 mt-2">
        <UButton
          to="/"
          icon="i-lucide-home"
          variant="soft"
          color="neutral"
        />

        <UBreadcrumb
          :items="items"
          class="pl-2"
        />

        <UButton
          icon="i-lucide-refresh-cw"
          variant="soft"
          color="neutral"
          @click="updateEntries"
        >
          Refresh
        </UButton>
      </div>

      <ol
        v-if="entries.length > 0"
        class="grid grid-cols-2 @3xl:grid-cols-3 @7xl:grid-cols-4"
      >
        <li
          v-for="entry in entries"
          :key="entry.name"
          class="*:m-auto"
        >
          <FolderItem
            v-if="entry.isDirectory"
            :path="`${folderPath}\\${entry.name}`"
            size="xl"
          />
          <FileVideo
            v-else
            :path="`${folderPath}\\${entry.name}`"
            class="w-full h-full"
          />
        </li>
      </ol>
      <UEmpty
        v-else
        icon="i-lucide-folder"
        title="No videos found"
        class="h-full"
        variant="naked"
        :actions="[
          {
            label: 'Home',
            icon: 'i-lucide-home',
            to: '/',
          },
          {
            label: 'Refresh',
            icon: 'i-lucide-refresh-cw',
            onClick: updateEntries,
          },
        ]"
      />
    </div>
  </div>
</template>
