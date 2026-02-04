import type { resolutions, videoExportExtensions } from '~/constants'

interface EncoderOptions {
  noAudio: boolean
  fileSizeMb: number
  encoder: string
  fps: number
  speed: number
  outputName: string
  outputExtension: typeof videoExportExtensions[number]
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

  const extraArguments = ref('')
  const extraVideoArguments = ref('')
  const extraAudioArguments = ref('')

  const exportType = computed(() => {
    switch (encoderOptions.value.outputExtension) {
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'dvr':
        return 'video'
      case 'webp':
      case 'avif':
        return 'animated'
      default:
        return 'image'
    }
  })

  return {
    encoderOptions,
    extraArguments,
    extraVideoArguments,
    extraAudioArguments,
    exportType,
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
