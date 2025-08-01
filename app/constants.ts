import type { DialogFilter } from '@tauri-apps/plugin-dialog'
import type { Video } from './types/video'

export const defaultVideoValues: Video = {
  cqv: 0,
  duration: 0,
  currentTime: 0,
  range: [0, 1],
}

export const parametersPerEncoders = {
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
  h264_nvenc: [
    {
      id: 3,
      name: 'cq:v',
      min: 0,
      max: 63,
      default: 0,
      type: 'inputnumber',
      description: '0 = auto',
    },
  ],
} as const

export const videoFilters: DialogFilter[] = [{
  name: 'video',
  extensions: ['.mp4', '.avi'],
}]
