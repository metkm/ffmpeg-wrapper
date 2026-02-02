export const useFilters = (
  initialFilters: MaybeRefOrGetter<Record<string, MaybeRefOrGetter<string | number | undefined>>>,
  extraArguments?: MaybeRefOrGetter<Record<string, MaybeRefOrGetter<string | number | undefined>>>,
) => {
  const filters = reactive<Record<string, MaybeRefOrGetter<string | number | undefined>>>({
    ...toValue(initialFilters),
  })

  const parsed = computed(() => {
    return Object
      .entries({ ...filters, ...toValue(extraArguments) })
      .map(([key, value]) => {
        if (!value) {
          return ''
        }

        return `${key}=${value}`
      })
      .filter(x => x)
      .join(',')
  })

  const set = (key: string, value: string) => {
    filters[key] = value
  }

  // example: abc=123 def=546
  const parseFilterFromString = (value: string) => {
    const s = value.split(' ')
    const result: Record<string, string> = {}

    for (const arg of s) {
      if (!arg) {
        continue
      }

      const [l, r] = arg.split('=')

      if (!l || !r) {
        continue
      }

      result[l] = r
    }

    return result
  }

  return {
    filters,
    set,
    parseFilterFromString,
    parsed,
  }
}
