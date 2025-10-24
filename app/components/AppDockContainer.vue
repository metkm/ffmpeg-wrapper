<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div class="fixed bottom-4 inset-x-4 flex justify-center pointer-events-none">
    <div
      class="pointer-events-auto"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </div>
</template>
