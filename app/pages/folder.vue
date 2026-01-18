<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { videoImportExtensions } from '~/constants'

definePageMeta({
  middleware: (to) => {
    if (!to.query.path)
      return false

    return true
  },
})

const folderPath = useRouteQuery('path', '')

const entries = ref<DirEntry[]>([])

const getEntries = async () => {
  try {
    entries.value = (await readDir(folderPath.value))
      .filter((item) => {
        if (item.isDirectory)
          return true

        const ext = item.name.split('\\').at(-1)?.split('.').at(-1)
        if (!ext)
          return false

        return videoImportExtensions.includes(ext as typeof videoImportExtensions[number])
      })
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

watch(folderPath, getEntries, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-2 grow">
    <div class="flex items-center justify-between gap-2 ring ring-default rounded-lg p-2">
      <UButton
        to="/"
        icon="i-lucide-home"
        variant="soft"
      />

      <UBreadcrumb
        :items="items"
        class="pl-2"
      />

      <UButton
        icon="i-lucide-refresh-cw"
        variant="soft"
        @click="getEntries"
      >
        Refresh
      </UButton>
    </div>

    <ol
      v-if="entries.length > 0"
      class="grid grid-cols-3"
    >
      <li
        v-for="entry in entries"
        :key="entry.name"
        class="flex hover:bg-muted/50 rounded-lg w-full h-full overflow-hidden"
      >
        <FolderItem
          v-if="entry.isDirectory"
          :path="`${folderPath}\\${entry.name}`"
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
          onClick: getEntries,
        },
      ]"
    />
  </div>
</template>
