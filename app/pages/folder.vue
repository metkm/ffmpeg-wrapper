<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { sep, join } from '@tauri-apps/api/path'
import type { DirEntry } from '@tauri-apps/plugin-fs'

definePageMeta({
  middleware: (to) => {
    if (!to.query.path)
      return false

    return true
  },
})

const folderPath = useRouteQuery('path', '')

const entries = ref<DirEntry[]>(await getFolderEntries(folderPath.value))

const updateEntries = async () => {
  try {
    entries.value = await getFolderEntries(folderPath.value)
  } catch {
    await navigateTo('/')
  }
}

const items = computedAsync(
  async () => {
    const result: BreadcrumbItem[] = []
    const spl = folderPath.value.split(sep())

    for (let index = 1; index < spl.length; index++) {
      const item = spl[index]
      if (!item)
        continue

      const base = await join(...spl.slice(0, index + 1))

      result.push({
        label: item,
        to: { name: 'folder', query: { path: base } },
      })
    }

    return result
  },
  [],
)

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
        class="grid grid-cols-5 xl:grid-cols-6"
      >
        <li
          v-for="entry in entries"
          :key="entry.name"
          class="*:m-auto p-2 relative after:-z-10 after:absolute after:inset-0 after:bg-elevated/50 after:rounded-md after:opacity-0 after:scale-90 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:will-change-[transform,opacity]"
        >
          <FolderItem
            :path="`${folderPath}\\${entry.name}`"
            class="w-full h-full"
            :is-directory="entry.isDirectory"
          />

          <!-- <AppSuspense>
            <FolderItem
              v-if="entry.isDirectory"
              :path="`${folderPath}\\${entry.name}`"
              size="xl"
              class="w-full h-full"
            />
            <FileVideo
              v-else
              :path="`${folderPath}\\${entry.name}`"
              class="w-full h-full"
            />
          </AppSuspense> -->
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
