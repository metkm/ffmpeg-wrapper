import { extname } from '@tauri-apps/api/path'
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { videoExtensionNames } from '~/constants'

export const getFolderEntries = async (path: string) => {
  const entries = await readDir(path)

  const result: DirEntry[] = []

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    if (!entry)
      continue

    if (entry.isDirectory) {
      result.push(entry)
      continue
    }

    const ext = await extname(entry.name)
    if (videoExtensionNames.includes(ext)) {
      result.push(entry)
    }
  }

  return result
}
