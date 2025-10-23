<script setup lang="ts">
const { pathHistory } = usePathsStore()

const folders = computed(() => {
  return pathHistory.map((history) => {
    return history.path
      .split('\\')
      .slice(0, -1)
      .join('\\')
  })
})
</script>

<template>
  <section class="flex flex-col gap-4 p-4">
    <UButton
      icon="i-lucide-chevron-up"
      square
      class="self-center"
    />

    <FolderContent
      v-for="folder in folders"
      :key="folder"
      :path="folder"
    />
  </section>

  <!-- <section class="p-4 rounded-(--ui-radius) w-full max-w-xl">
    <div
      v-if="isHistoryEmpty"
      class="flex items-center justify-center rounded-(--ui-radius) bg-muted h-32 border border-muted w-full"
    >
      <p class="text-sm text-muted font-medium">
        File is history is currently empty.
      </p>
    </div>

    <template v-else>
      <h1 class="text-sm mb-2 font-medium">
        Recently opened folders & files {{ isHistoryEmpty ? 'will show up here' : '' }}
      </h1>

      <ol class="bg-muted w-full rounded-(--ui-radius) border border-muted">
        <li
          v-for="history in pathHistory"
          :key="history.path"
          class="grid grid-cols-[1fr_min-content_1fr_min-content] p-2 hover:bg-muted rounded-full"
        >
          <UTooltip :text="history.path.split('\\').slice(0, -1).join('\\')">
            <UButton
              icon="i-lucide-folder"
              size="sm"
              variant="ghost"
              class="min-w-0"
              @click="openFolder(history.path)"
            >
              <span
                class="truncate text-left text-rtl"
                style="direction: rtl;"
              >
                {{ history.path.split('\\').slice(0, -1).join('\\') }}
              </span>
            </UButton>
          </UTooltip>

          <span class="mr-2 text-muted font-semibold">\</span>

          <UTooltip :text="history.path.split('\\').at(-1)">
            <UButton
              icon="i-lucide-file"
              size="sm"
              variant="ghost"
              class="min-w-0"
              @click="openPath(history.path)"
            >
              <span class="truncate">
                {{ history.path.split('\\').at(-1) }}
              </span>
            </UButton>
          </UTooltip>

          <UButton
            icon="i-lucide-chevron-right"
            size="sm"
            class="min-w-0"
            :to="{
              name: 'export',
              query: {
                path: history.path,
              },
            }"
            block
            variant="soft"
          >
            Edit
          </UButton>

          <p class="text-xs text-muted font-medium ml-2">
            {{ history.date.toLocaleString() }}
          </p>
        </li>
      </ol>
    </template>
  </section> -->
</template>
