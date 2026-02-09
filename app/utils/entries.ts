import { extname } from '@tauri-apps/api/path'
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { videoExtensionNames } from '~/constants'

export const getVideoEntries = async (path: string) => {
  const entries = await readDir(path)

  const result: DirEntry[] = []

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]

    if (!entry || entry.isDirectory)
      continue

    const ext = await extname(entry.name)
    if (videoExtensionNames.includes(ext)) {
      result.push(entry)
    }
  }

  return result
}
