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

  const get = (key: IDBValidKey) => {
    return new Promise<Item | undefined>((resolve) => {
      if (!db.value) {
        resolve(undefined)
        return
      }

      const tx = db.value.transaction(name, 'readwrite')
      const st = tx.objectStore(name)

      const g = st.get(key)

      g.addEventListener('success', (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        resolve(event.target!.result as Item)
      }, { once: true })
    })
  }

  const put = (value: Item, key: IDBValidKey) => {
    return new Promise((resolve) => {
      if (!db.value) {
        resolve(undefined)
        return
      }

      const tx = db.value.transaction(name, 'readwrite')
      const st = tx.objectStore(name)

      st.put(value, key)

      resolve(undefined)
    })
  }

  return {
    get,
    put,
  }
}
