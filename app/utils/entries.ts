import { readDir } from '@tauri-apps/plugin-fs'
import { videoExtensionNames } from '~/constants'

export const getVideoEntries = async (path: string) => {
  const entries = await readDir(path)

  return entries.filter((item) => {
    if (item.isDirectory)
      return true

    const ext = item.name.split('\\').at(-1)?.split('.').at(-1)
    if (!ext)
      return false

    return videoExtensionNames.includes(ext as typeof videoExtensionNames[number])
  })
}
