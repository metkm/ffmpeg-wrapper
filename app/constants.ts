import type { DialogFilter } from '@tauri-apps/plugin-dialog'
import type { Video } from './types/video'

export const encoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
]

export const videoFilters: DialogFilter[] = [{
  name: 'video',
  extensions: ['mp4', 'avi', 'mov', 'webm'],
}]
