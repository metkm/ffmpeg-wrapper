import type { SelectItem } from '@nuxt/ui'

export const videoEncoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
  'copy',
]

export const resolutions = ['640x480', '1280x720', '1920x1080', '2560x1440'] as const satisfies string[]

const videoExtensions = ['mp4', 'avi', 'mov', 'dvr'] as const satisfies string[]
const imageExtensions = ['png', 'jpg'] as const satisfies string[]
const imageAnimatedExtensions = ['webp', 'avif'] as const satisfies string[]

export const videoImportExtensions = videoExtensions
export const videoExportExtensions = [...videoExtensions, ...imageExtensions, ...imageAnimatedExtensions]

export const videoExportItems = [...videoExtensions, { type: 'separator' }, ...imageExtensions, { type: 'separator' }, ...imageAnimatedExtensions] satisfies SelectItem[]
