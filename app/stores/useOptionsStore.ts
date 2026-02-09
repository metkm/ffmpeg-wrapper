import { dirname, join } from '@tauri-apps/api/path'
import { fileExtensions, type resolutions } from '~/constants'

interface EncoderOptions {
  noAudio: boolean
  fileSizeMb: number
  encoder: string
  fps: number
  speed: number
  outputName: string
  outputExtension: typeof fileExtensions[number]['name']
  resolution?: typeof resolutions[number]
}

export const useOptionsStore = defineStore('options', () => {
  const encoderOptions = ref<EncoderOptions>({
    fileSizeMb: 10,
    encoder: 'h264_nvenc',
    noAudio: false,
    fps: 60,
    speed: 1,
    outputName: 'output',
    outputExtension: 'mp4',
  })

  const savePath = ref('')
  const rememberSavePath = ref(false)

  const extraArguments = ref('')
  const extraVideoArguments = ref('')
  const extraAudioArguments = ref('')

  const exportType = computed(() => fileExtensions.find(ext => ext.name === encoderOptions.value.outputExtension)?.type || 'video')

  watch(
    [() => encoderOptions.value.outputName, () => encoderOptions.value.outputExtension],
    async ([name, ext]) => {
      if (!savePath.value)
        return

      const dirName = await dirname(savePath.value)
      savePath.value = await join(dirName, name.length < 1 ? `output.${ext}` : `${name}.${ext}`)
    },
  )

  return {
    encoderOptions,
    extraArguments,
    extraVideoArguments,
    extraAudioArguments,
    exportType,
    savePath,
    rememberSavePath,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    beforeHydrate: (context) => {
      window.addEventListener('storage', () => {
        context.store.$hydrate({ runHooks: false })
      })
    },
  },
})
