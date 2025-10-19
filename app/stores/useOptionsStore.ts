interface EncoderOptions {
  noAudio: boolean
  fileSizeMb: number
  encoder: string
  fps: number
  speed: number
  twoPass: boolean
}

export const useOptionsStore = defineStore('options', () => {
  const encoderOptions = ref<EncoderOptions>({
    fileSizeMb: 10,
    encoder: 'h264_nvenc',
    noAudio: false,
    fps: 60,
    speed: 1,
    twoPass: false,
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
