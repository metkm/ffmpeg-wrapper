import { dirname } from '@tauri-apps/api/path'

interface FolderHistory {
  path: string
  date: Date
}

const HISTORY_LIMIT = 3

const getOldestPathHistoryIndex = (items: FolderHistory[]) => {
  if (items.length < 1)
    return -1

  if (items.length === 1)
    return 0

  let smallest = items[0]
  const index = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item)
      continue

    if (item.date.getTime() < smallest!.date.getTime()) {
      smallest = item
    }
  }

  return index
}

export const usePathsStore = defineStore('paths', () => {
  const folderHistory = ref<FolderHistory[]>([])

  const addPathToFolderHistory = async (path: string) => {
    const dirName = await dirname(path)

    const i = folderHistory.value.findIndex(h => h.path === dirName)
    if (i !== -1) {
      folderHistory.value[i]!.date = new Date()
      return
    }

    folderHistory.value.push({ path: dirName, date: new Date() })

    if (folderHistory.value.length > HISTORY_LIMIT) {
      const i = getOldestPathHistoryIndex(folderHistory.value)

      if (i !== -1) {
        folderHistory.value.splice(i, 1)
      }
    }
  }

  const folderHistorySorted = useSorted(folderHistory, (a, b) => a.date.getTime() - b.date.getTime())

  return {
    folderHistory,
    addPathToFolderHistory,
    folderHistorySorted,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    serializer: {
      deserialize: (data: string) => {
        return JSON.parse(data, (key, value) => {
          if (key === 'date') {
            return new Date(value)
          }

          return value
        })
      },
      serialize: JSON.stringify,
    },
  },
})
