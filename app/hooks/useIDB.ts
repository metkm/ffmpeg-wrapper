export const useIDB = <Item>(name: string) => {
  const db = shallowRef<IDBDatabase>()

  const request = window.indexedDB.open(name, 1)

  request.onupgradeneeded = (event) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const result = event.target!.result as IDBDatabase
    result.createObjectStore(name)
  }

  request.onsuccess = (event) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const result = event.target!.result as IDBDatabase
    db.value = result
  }

  const getStore = () => {
    const tx = db.value?.transaction(name, 'readwrite')
    return tx?.objectStore(name)
  }

  const get = (key: IDBValidKey) => {
    return new Promise<Item>((resolve, reject) => {
      const store = getStore()

      if (!store)
        return reject()

      const g = store.get(key)

      g.addEventListener('success', (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        resolve(event.target!.result as Item)
      }, { once: true })
    })
  }

  const put = (value: Item, key: IDBValidKey) => {
    return new Promise<void>((resolve, reject) => {
      const store = getStore()

      if (!store)
        return reject()

      store.put(value, key)
      resolve()
    })
  }

  return {
    get,
    put,
  }
}
