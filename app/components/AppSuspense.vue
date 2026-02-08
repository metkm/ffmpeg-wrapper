<template>
  <Suspense>
    <slot />

    <template #fallback>
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 shrink-0 animate-spin mx-auto"
      />
    </template>
  </Suspense>
</template>
