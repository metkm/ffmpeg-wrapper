interface PathHistory {
  path: string
  date: Date
}

const HISTORY_LIMIT = 3

export const usePathsStore = defineStore('paths', () => {
  const pathHistory = ref<PathHistory[]>([])

  const addPathHistory = (path: string) => {
    if (pathHistory.value.find(h => h.path === path))
      return

    const history: PathHistory = {
      path,
      date: new Date(),
    }

    console.log(pathHistory.value.length, HISTORY_LIMIT)
    if (pathHistory.value.length >= HISTORY_LIMIT) {
      pathHistory.value.splice(0, pathHistory.value.length - HISTORY_LIMIT + 1)
      pathHistory.value.push(history)
      return
    }

    pathHistory.value.push(history)
  }

  return {
    pathHistory,
    addPathHistory,
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
