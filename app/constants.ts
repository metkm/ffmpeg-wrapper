import type { DialogFilter } from '@tauri-apps/plugin-dialog'
import type { Video } from './types/video'

export const defaultVideoValues: Video = {
  duration: 0,
  currentTime: 0,
  durationRange: [0, 1],
  crop: {
    top: 0,
    left: 0,
    height: 0,
    width: 0,
  },
  volume: 0,
}

export const encoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
] as const

// export const defaultEncoderOptions = {
//   name: 'cq:v',
//   min: 0,
//   max: 51,
//   default: 1,
//   type: 'inputnumber',
//   description: '0 = auto',
// }

// export const parametersPerEncoders = {
//   av1_nvenc: [
//     {
//       id: 1,
//       ...defaultEncoderOptions,
//     },
//   ],
//   h264_nvenc: [
//     {
//       id: 3,
//       ...defaultEncoderOptions,
//     },
//   ],
//   libx264: [
//     {
//       id: 2,
//       ...defaultEncoderOptions,
//     },
//   ],
//   libx265: [
//     {
//       id: 4,
//       ...defaultEncoderOptions,
//     },
//   ],
// } as const

export const videoFilters: DialogFilter[] = [{
  name: 'video',
  extensions: ['mp4', 'avi', 'mov', 'webm'],
}]
