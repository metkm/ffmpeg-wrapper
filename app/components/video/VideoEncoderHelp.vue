<script setup lang="ts">
import { useCommand } from '~/hooks/useCommand'

const props = defineProps<{
  encoder: string
}>()

const { lines, spawn } = useCommand()

const input = ref('')

const showEncoderHelp = () => {
  spawn('binaries/ffmpeg', ['-h', `encoder=${props.encoder}`])
}

const onSubmit = () => {
  spawn('binaries/ffmpeg', input.value.split(' '))
}

watch(() => props.encoder, showEncoderHelp, { immediate: true })
</script>

<template>
  <UModal :ui="{ content: 'max-w-5xl h-full' }">
    <UButton
      variant="subtle"
      icon="i-lucide-terminal"
    />

    <template #content>
      <div class="flex flex-col gap-2 max-h-full h-full overflow-hidden p-2">
        <pre
          ref="stdoutContainer"
          class="text-sm w-full h-full overflow-auto"
        >
          {{ lines.join("\n") }}
        </pre>

        <form
          class="w-full"
          @submit.prevent="onSubmit"
        >
          <UInput
            v-model="input"
            class="w-full"
          />
        </form>
      </div>
    </template>
  </UModal>
</template>
