export const useIDB = () => {
  const db = shallowRef<IDBDatabase>()

  const request = window.indexedDB.open('thumbnails', 1)

  request.onupgradeneeded = (event) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const result = event.target!.result as IDBDatabase

    result.createObjectStore('thumbnails', { keyPath: 'path' })
  }

  request.onsuccess = (event) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const result = event.target!.result as IDBDatabase

    db.value = result

    // const tx = result.transaction('thumbnails', 'readwrite')
    // store.value = tx.objectStore('thumbnails')
  }

  const get = (id: IDBValidKey): Promise<{ path: string, buffer: number[] } | undefined> => {
    return new Promise((resolve) => {
      if (!db.value) {
        resolve(undefined)
        return
      }

      const tx = db.value.transaction('thumbnails', 'readwrite')
      const st = tx.objectStore('thumbnails')

      const g = st.get(id)

      g.addEventListener('success', (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        resolve(event.target!.result as T)
      }, { once: true })
    })
  }

  const put = (path: IDBValidKey, buffer: number[]) => {
    return new Promise((resolve) => {
      if (!db.value) {
        resolve(undefined)
        return
      }

      const tx = db.value.transaction('thumbnails', 'readwrite')
      const st = tx.objectStore('thumbnails')

      st.put({
        path,
        buffer,
      })

      resolve(undefined)
    })
  }

  return {
    get,
    put,
  }
}
