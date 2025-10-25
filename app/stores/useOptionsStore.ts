import type { resolutions } from '~/constants'

interface EncoderOptions {
  noAudio: boolean
  fileSizeMb: number
  encoder: string
  fps: number
  speed: number
  // twoPass: boolean
  outputName: string
  frameLimit: number
  resolution?: typeof resolutions[number]
}

export const useOptionsStore = defineStore('options', () => {
  const encoderOptions = ref<EncoderOptions>({
    fileSizeMb: 10,
    encoder: 'h264_nvenc',
    noAudio: false,
    fps: 60,
    speed: 1,
    outputName: 'output.mp4',
    frameLimit: 1,
  })

  return {
    encoderOptions,
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
