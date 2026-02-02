type PossibleKeyValues = MaybeRefOrGetter<string | boolean | number | undefined>
type Arguments = Record<string, PossibleKeyValues>

export const useArguments = (
  initialArguments: MaybeRefOrGetter<Arguments>,
  extraArguments?: MaybeRefOrGetter<Arguments>,
) => {
  const args = reactive<Arguments>({
    y: true,
    ...toValue(initialArguments),
  })

  const parsed = computed(() => {
    return Object
      .entries({ ...args, ...toValue(extraArguments) })
      .map(([key, value]) => {
        const result = [`-${key}`]

        if (typeof value === 'boolean') {
          if (value) {
            return result
          }

          return []
        }

        if (!value) {
          return []
        }

        result.push(value.toString())
        return result
      })
      .flat()
  })

  const set = (key: string, value?: PossibleKeyValues) => {
    args[key] = value ? value.toString() : true
  }

  // example
  // -rc vbr -an -lookahead 4
  const parseArgumentsFromString = (value: string) => {
    const s = value.split('-')
    const result: Record<string, PossibleKeyValues> = {}

    for (const arg of s) {
      if (!arg) {
        continue
      }

      const [l, r] = arg.split(' ')

      if (!l) {
        continue
      }

      result[l] = r || true
    }

    return result
  }

  return {
    args,
    parsed,
    set,
    parseArgumentsFromString,
  }
}
