interface UseKeepScrollBottomProps {
  container: MaybeRefOrGetter<HTMLElement | null>
  threshold?: MaybeRefOrGetter<number>
}

export const useKeepScrollBottom = (props: UseKeepScrollBottomProps) => {
  const isNearEnd = ref(true)

  const checkIsNearEnd = () => {
    const element = toValue(props.container)
    if (!element)
      return

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    isNearEnd.value = distanceFromBottom < (toValue(props.threshold) || 0)
  }

  useEventListener(props.container, 'scroll', checkIsNearEnd)

  const updateScrollPosition = async () => {
    await nextTick()

    if (!isNearEnd.value)
      return

    const element = toValue(props.container)
    if (!element)
      return

    element.scrollTo({
      top: element.scrollHeight,
    })
  }

  return {
    updateScrollPosition,
    isNearEnd,
  }
}
