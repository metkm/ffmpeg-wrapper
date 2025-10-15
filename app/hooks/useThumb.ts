export const useThumb = (
  target: MaybeRefOrGetter<HTMLElement | null>,
  container: MaybeRefOrGetter<HTMLElement | null>,
) => {
  const { width: containerWidth } = useElementSize(container, undefined, { box: 'border-box' })
  const { width: targetWidth } = useElementBounding(target)

  const pressDelta = ref({
    x: 0,
  })

  const positionNormalized = ref({
    x: 0,
  })

  const start = (event: PointerEvent) => {
    const containerElement = toValue(container)
    const targetElement = toValue(target)!

    const targetBounding = targetElement.getBoundingClientRect()
    const containerBounding = containerElement?.getBoundingClientRect()

    pressDelta.value = {
      x: event.clientX - (targetBounding.left - containerBounding!.left),
    }

    toValue(target)?.setPointerCapture(event.pointerId)
  }

  const move = (event: PointerEvent) => {
    if (event.buttons === 0)
      return

    const offsetx = event.clientX - pressDelta.value.x

    positionNormalized.value.x = offsetx / containerWidth.value
  }

  const end = () => {

  }

  const offsetX = computed(() => clamp(positionNormalized.value.x * containerWidth.value, 0, containerWidth.value - targetWidth.value))

  useEventListener(target, 'pointerdown', start)
  useEventListener(target, 'pointermove', move)
  useEventListener(target, 'pointerup', end)

  return {
    offsetX,
  }
}
