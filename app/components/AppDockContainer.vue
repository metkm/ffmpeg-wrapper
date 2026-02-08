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

  return `${v === 'bottom' ? 'bottom-dock-inset' : 'top-dock-inset'} ${h === 'left' ? 'left-dock-inset' : h === 'center' ? 'left-dock-inset right-dock-inset' : 'right-dock-inset'}`
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
