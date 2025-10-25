import type { DialogFilter } from '@tauri-apps/plugin-dialog'

export const encoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
]

export const imageFormats = ['.jpeg', '.png', '.jpg']

export const resolutions = ['640x480', '1280x720', '1920x1080', '2560x1440']

export const videoFilters: DialogFilter[] = [{
  name: 'video',
  extensions: ['mp4', 'avi', 'mov', 'webp'],
}]
