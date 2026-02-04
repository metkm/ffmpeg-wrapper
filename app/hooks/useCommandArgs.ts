type PossibleKeyValues = MaybeRefOrGetter<string | boolean | number | undefined>
type Arguments = Record<string, PossibleKeyValues>

export const useCommandArgs = (
  type: 'arg' | 'filter',
  initialArgs: MaybeRefOrGetter<Arguments>,
  extraArguments?: MaybeRefOrGetter<Arguments>,
) => {
  const args = reactive<Arguments>(toValue(initialArgs))

  const argsObjectFiltered = computed(() => {
    const result: Record<string, Omit<PossibleKeyValues, 'undefined'>> = {}

    for (const [k, v] of Object.entries({ ...args, ...toValue(extraArguments) })) {
      if (!v) {
        continue
      }

      if (type === 'arg' && typeof v === 'boolean' && !v) {
        continue
      }

      result[k] = v
    }

    return result
  })

  const parsedArgs = computed(() =>
    Object.entries(argsObjectFiltered.value)
      .map(([k, v]) => type === 'arg' ? [`-${k}`, v?.toString()] : [`${k}=${v}`])
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

    return result
  }

  return {
    args,
    argsObjectFiltered,
    parsedArgs,
    parseArgsFromString,
  }
}
