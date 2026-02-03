type PossibleKeyValues = MaybeRefOrGetter<string | boolean | number | undefined>
type Arguments = Record<string, PossibleKeyValues>

export const useCommandArgs = (
  type: 'arg' | 'filter',
  initialArgs: MaybeRefOrGetter<Arguments>,
  extraArguments?: MaybeRefOrGetter<Arguments>,
) => {
  const args = reactive<Arguments>(toValue(initialArgs))

  const parsedArgs = computed(() =>
    Object.entries({ ...args, ...toValue(extraArguments) })
      .map(([k, v]) => {
        if (type === 'arg') {
          const r = [`-${k}`]

          if (!v) {
            return []
          }

          if (typeof v === 'boolean') {
            return v ? r : []
          }

          return [`-${k}`, v.toString()]
        } else {
          if (!v) {
            return []
          }

          return [`${k}=${v}`]
        }
      })
      .flat(),
  )

  // example
  // -rc vbr -an -lookahead 4
  // abc=123 def=546

  const parseArgsFromString = (value: string) => {
    const result: Record<string, PossibleKeyValues> = {}
    if (!value) {
      return result
    }

    // Case 1: -key value / -flag
    if (type === 'arg') {
    // Match: -key value?  (value optional)
      const matches = value.match(/-(\S+)(?:\s+(\S+))?/g) ?? []

      for (const match of matches) {
        const [, key, val] = match.match(/-(\S+)(?:\s+(\S+))?/)!
        result[key!] = val ?? true
      }

      return result
    }

    // Case 2: key=value,key=value
    const pairs = value.split(',')

    for (const pair of pairs) {
      if (!pair) continue
      const [key, val] = pair.split('=')
      if (!key) continue
      result[key] = val ?? true
    }

    // const split = value.split(type === 'arg' ? '-' : ',')

    // for (let index = 0; index < split.length; index++) {
    //   const element = split[index]
    //   if (!element) {
    //     continue
    //   }

    //   const [key, value] = element.split(type === 'arg' ? ' ' : '=')
    //   if (!key) {
    //     continue
    //   }

    //   result[key] = value || true
    // }

    return result
  }

  return {
    args,
    parsedArgs,
    parseArgsFromString,
  }
}
