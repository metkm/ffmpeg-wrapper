<template>
  <Suspense>
    <slot />

    <template #fallback>
      <slot name="fallback">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 shrink-0 animate-spin m-auto"
        />
      </slot>
    </template>
  </Suspense>
</template>
