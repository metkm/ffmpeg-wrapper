interface EncoderOptions {
  noAudio: boolean
  fileSizeKb: number
  encoder: string
  fps: number
  speed: number
}

export const useOptionsStore = defineStore('options', () => {
  const encoderOptions = ref<EncoderOptions>({
    fileSizeKb: 10 * 1024,
    encoder: 'h264_nvenc',
    noAudio: false,
    fps: 60,
    speed: 1,
  })

  return {
    encoderOptions,
  }
}, {
  persist: true,
})
