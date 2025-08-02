<script setup lang="ts">
import { parametersPerEncoders } from '~/constants'
import type { Encoder } from '~/types/parameters'

const props = defineProps<{
  encoder: Encoder
}>()

const modelValue = defineModel<string[]>({
  default: [],
})

const args = ref<[string, number][]>([])

const parameters = computed(() => parametersPerEncoders[props.encoder])

watch(args, () => {
  modelValue.value = args.value
    .flatMap(([name, value]) => [name, value.toString()])
}, {
  deep: true,
})

// filters arguments that doesn't exist in the new encoder
watch(() => props.encoder, () => {
  args.value = args.value
    .filter(arg => parameters.value.find(encoderParam => arg[0].includes(encoderParam.name)))
})
</script>

<template>
  <ul class="flex flex-wrap">
    <li
      v-for="(param, index) in parameters"
      :key="param.id"
      class="flex-1"
    >
      <CommandParameter
        v-model="args"
        :index="index"
        :parameter="param"
        class="flex-1"
      />
    </li>
  </ul>
</template>
