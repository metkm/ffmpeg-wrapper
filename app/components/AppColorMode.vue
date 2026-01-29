<script setup lang="ts">
const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = [
  {
    primary: 'coffee',
    neutral: 'coffee-neutral',
  },
  {
    primary: 'brown',
    neutral: 'neutral',
  },
] as const

const modes = [
  {
    label: 'dark',
    icon: 'i-lucide-moon',
  },
  {
    label: 'light',
    icon: 'i-lucide-sun',
  },
  {
    label: 'system',
    icon: 'i-lucide-computer',
  },
] as const

const mode = computed({
  get() {
    return colorMode.value
  },
  set(m: string) {
    colorMode.preference = m
  },
})

const color = computed({
  get() {
    return {
      primary: appConfig.ui.colors.primary as 'coffee' | 'brown',
      neutral: appConfig.ui.colors.neutral as 'coffee-neutral' | 'neutral',
    }
  },
  set(color: typeof colors[number]) {
    appConfig.ui.colors.primary = color.primary
    appConfig.ui.colors.neutral = color.neutral

    window.localStorage.setItem('nuxt-ui-primary', color.primary)
    window.localStorage.setItem('nuxt-ui-neutral', color.neutral)
  },
})

const storedPrimary = window.localStorage.getItem('nuxt-ui-primary')
const storedNeutral = window.localStorage.getItem('nuxt-ui-neutral')

if (storedPrimary) {
  appConfig.ui.colors.primary = storedPrimary
}

if (storedNeutral) {
  appConfig.ui.colors.neutral = storedNeutral
}
</script>

<template>
  <UPopover :ui="{ content: 'p-2 flex flex-col gap-2' }">
    <UButton
      icon="i-lucide-swatch-book"
      variant="ghost"
      size="xs"
    />

    <template #content>
      <fieldset>
        <legend class="text-sm font-semibold pl-1 mb-1">
          Primary
        </legend>

        <ol class="flex gap-2">
          <li
            v-for="c in colors"
            :key="c.primary"
          >
            <UButton
              color="neutral"
              variant="outline"
              :label="c.primary"
              size="sm"
              @click="color = c"
            >
              <template #leading>
                <div
                  class="size-4 rounded-lg ring ring-default"
                  :style="{ backgroundColor: `var(--color-${c.primary}-400)` }"
                />
              </template>
            </UButton>
          </li>
        </ol>
      </fieldset>

      <fieldset>
        <legend class="text-sm font-semibold pl-1 mb-1">
          Color mode
        </legend>

        <div class="flex gap-2">
          <UButton
            v-for="m in modes"
            :key="m.label"
            v-bind="m"
            size="sm"
            variant="outline"
            color="neutral"
            class="capitalize"
            :class="[colorMode.preference === m.label ? 'bg-elevated' : 'hover:bg-elevated/50']"
            @click="mode = m.label"
          />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>
