export const encoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
]

export const imageExtensions = ['.jpeg', '.png', '.jpg'] as const satisfies string[]

export const resolutions = ['640x480', '1280x720', '1920x1080', '2560x1440'] as const satisfies string[]

export const videoImportExtensions = ['mp4', 'avi', 'mov'] as const satisfies string[]
export const videoExportExtensions = [...videoImportExtensions, 'webp', 'png'] as const satisfies string[]
