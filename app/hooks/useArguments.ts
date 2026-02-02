type PossibleKeyValues = MaybeRefOrGetter<string | boolean | number | undefined>

export const useArguments = (initialArguments: MaybeRefOrGetter<Record<string, PossibleKeyValues>>) => {
// export const useArguments = (initialArguments: MaybeRefOrGetter<Record<string, PossibleKeyValues>>) => {

  const args = reactive<Record<string, PossibleKeyValues>>({
    y: true,
    ...toValue(initialArguments),
  })
  // const args = reactive(new Map<string, PossibleKeyValues>())

  const argsParsed = computed(() => {
    return Object
      .entries(args)
      .map(([key, value]) => {
        const result = [`-${key}`]

        if (typeof value === 'boolean') {
          if (value) {
            return result
          }

          return []
        }

        if (value === undefined) {
          return []
        }

        result.push(value.toString())
        return result
      })
      .flat()
  })

  const add = (key: string, value?: PossibleKeyValues) => {
    args[key] = value ? value.toString() : true

    // console.log(key, value)
    // args.set(key, value ? value.toString() : true)
  }

  return {
    args,
    argsParsed,
    add,
  }
}
