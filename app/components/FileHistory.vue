<script setup lang="ts">
import { openPath } from '@tauri-apps/plugin-opener'

const { pathHistory } = usePathsStore()

const openFolder = (path: string) => {
  const p = path
    .split('\\')
    .slice(0, -1)
    .join('\\')

  openPath(p)
}
</script>

<template>
  <section class="p-4 pl-0 rounded-(--ui-radius) max-w-2xl">
    <h1 class="text-sm ml-4 mb-2">
      Recently opened folders & files
    </h1>

    <ol>
      <li
        v-for="path in pathHistory"
        :key="path"
        class="grid grid-cols-[1fr_min-content_1fr_min-content] p-2 hover:bg-muted rounded-full"
      >
        <UButton
          icon="i-lucide-folder"
          size="sm"
          variant="ghost"
          class="min-w-0"
          @click="openFolder(path)"
        >
          <span
            class="truncate text-left text-rtl"
            style="direction: rtl;"
          >
            {{ path.split('\\').slice(0, -1).join('\\') }}
          </span>
        </UButton>

        <span class="mr-2 text-muted font-semibold">\</span>

        <UButton
          icon="i-lucide-file"
          size="sm"
          variant="ghost"
          class="min-w-0"
          @click="openPath(path)"
        >
          <span class="truncate">
            {{ path.split('\\').at(-1) }}
          </span>
        </UButton>

        <UButton
          icon="i-lucide-chevron-right"
          size="sm"
          class="min-w-0"
          :to="{
            name: 'export',
            query: {
              path,
            },
          }"
          block
        >
          Edit
        </UButton>
      </li>
    </ol>
  </section>
</template>
