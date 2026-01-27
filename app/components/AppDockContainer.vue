<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

type Horizontal = 'left' | 'right' | 'center'
type Vertical = 'top' | 'bottom'

const props = defineProps<{
  side: `${Vertical}-${Horizontal}`
}>()

const insets = computed(() => {
  const [left, right] = props.side.split('-')

  const v: Vertical = (left as Vertical | undefined) || 'bottom' satisfies Vertical
  const h: Horizontal = (right as Horizontal | undefined) || 'right' satisfies Horizontal

  return `${v === 'bottom' ? 'bottom-4' : 'top-4'} ${h === 'left' ? 'left-4' : h === 'center' ? 'left-4 right-4' : 'right-4'}`
})
</script>

<template>
  <div
    class="fixed flex justify-center pointer-events-none z-50"
    :class="insets"
  >
    <div
      class="pointer-events-auto"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </div>
</template>
