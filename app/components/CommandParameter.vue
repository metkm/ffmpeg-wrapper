<script setup lang="ts">
import type { Parameter } from '~/types/parameters'

const props = defineProps<{
  parameter: Parameter
}>()

const arg = defineModel<[string, number][]>({
  default: [],
})

const value = ref(props.parameter.default || 0)

watch(value, () => {
  const argName = `-${props.parameter.name}`

  const valueIndex = arg.value.findIndex(
    value => value[0] === argName,
  )

  if (valueIndex === -1) {
    arg.value.push([argName, value.value])
  } else {
    arg.value[valueIndex] = [argName, value.value]
  }
})
</script>

<template>
  <div>
    <UFormField
      v-if="parameter.type === 'inputnumber'"
      :label="parameter.name"
      :description="parameter.description"
    >
      <UInputNumber
        v-model="value"
        :min="parameter.min"
        :max="parameter.max"
        variant="soft"
        color="neutral"
      />
    </UFormField>
  </div>
</template>
