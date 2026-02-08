import type { SelectItem } from '@nuxt/ui'

type FileTypes = 'animated' | 'video' | 'image'

export const videoEncoders = [
  'av1_nvenc',
  'h264_nvenc',
  'libx264',
  'libx265',
  'copy',
]

export const resolutions = ['640x480', '1280x720', '1920x1080', '2560x1440'] as const satisfies string[]

export const fileExtensions: { name: string, type: FileTypes }[] = [
  {
    name: 'mp4',
    type: 'video',
  },
  {
    name: 'avi',
    type: 'video',
  },
  {
    name: 'mov',
    type: 'video',
  },
  {
    name: 'dvr',
    type: 'video',
  },
  {
    name: 'webm',
    type: 'video',
  },
  {
    name: 'png',
    type: 'image',
  },
  {
    name: 'jpg',
    type: 'image',
  },
  {
    name: 'webp',
    type: 'animated',
  },
  {
    name: 'avif',
    type: 'animated',
  },
]

export const fileExtensionNames = fileExtensions.map(ext => ext.name)

export const videoExtensionNames = fileExtensions
  .filter(ext => ext.type === 'video')
  .map(ext => ext.name)

export const imageExtensionNames = fileExtensions
  .filter(ext => ext.type === 'image')
  .map(ext => ext.name)

export const animatedExtensionNames = fileExtensions
  .filter(ext => ext.type === 'animated')
  .map(ext => ext.name)

export const outputExtensionSelectItems: SelectItem[] = [
  ...videoExtensionNames,
  { type: 'separator' },
  ...imageExtensionNames,
  { type: 'separator' },
  ...animatedExtensionNames,
]

// const videoExtensions = ['mp4', 'avi', 'mov', 'dvr'] as const satisfies string[]
// const imageExtensions = ['png', 'jpg'] as const satisfies string[]
// const imageAnimatedExtensions = ['webp', 'avif'] as const satisfies string[]

// export const videoImportExtensions = videoExtensions
// export const videoExportExtensions = [...videoExtensions, ...imageExtensions, ...imageAnimatedExtensions]

// export const videoExportItems = [...videoExtensions, { type: 'separator' }, ...imageExtensions, { type: 'separator' }, ...imageAnimatedExtensions] satisfies SelectItem[]
