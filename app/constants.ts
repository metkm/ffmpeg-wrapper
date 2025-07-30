import type { Video } from './types/video'

export const defaultVideoValues: Video = {
  cqv: 0,
  duration: 0,
  currentTime: 0,
  range: [0, 1],
}

export const parametersPerEncoders = {
  libx264: [
    {
      id: 1,
      name: 'crf',
      min: 0,
      max: 52,
      default: 26,
      type: 'inputnumber',
    },
  ],
  av1_nvenc: [
    {
      id: 2,
      name: 'cq:v',
      min: 0,
      max: 63,
      default: 0,
      type: 'inputnumber',
      description: '0 = auto',
    },
  ],
} as const
