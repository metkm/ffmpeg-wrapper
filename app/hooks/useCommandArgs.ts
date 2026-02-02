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

    const split = value.split(type === 'arg' ? '-' : ',')

    for (let index = 0; index < split.length; index++) {
      const element = split[index]
      if (!element) {
        continue
      }

      const [key, value] = element.split(type === 'arg' ? ' ' : '=')
      if (!key) {
        continue
      }

      result[key] = value || true
    }

    return result
  }

  return {
    args,
    parsedArgs,
    parseArgsFromString,
  }
}
