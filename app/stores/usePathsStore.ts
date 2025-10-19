export const usePathsStore = defineStore('paths', () => {
  const pathHistory = ref<string[]>([])

  const addPathHistory = (path: string) => {
    if (pathHistory.value.includes(path))
      return

    if (pathHistory.value.length === 5) {
      pathHistory.value.splice(0, 1)
      pathHistory.value.push(path)
      return
    }

    pathHistory.value.push(path)
  }

  return {
    pathHistory,
    addPathHistory,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
