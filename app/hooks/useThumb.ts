export const useThumb = (
  target: MaybeRefOrGetter<HTMLElement | null>,
  options: {
    containerElement: MaybeRefOrGetter<HTMLElement | null>
    initialValue?: { x: number } // these values should be between 0 and 1
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    onMove?: (x: number, event: PointerEvent) => boolean | void // returning false doesn't move the element
  },
) => {
  const { width: containerWidth } = useElementSize(options.containerElement, undefined, { box: 'border-box' })
  const { width: targetWidth } = useElementBounding(target)

  const pressDelta = ref({
    x: 0,
  })

  const positionNormalized = ref({
    x: options.initialValue?.x || 0,
  })

  const start = (event: PointerEvent) => {
    const containerElement = toValue(options.containerElement)
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

    const x = clamp(event.clientX - pressDelta.value.x, 0, containerWidth.value)

    if (options.onMove?.(x, event) === false)
      return

    positionNormalized.value.x = x / containerWidth.value
  }

  const offsetX = computed(() => clamp(positionNormalized.value.x * containerWidth.value, 0, containerWidth.value - targetWidth.value))

  useEventListener(target, 'pointerdown', start)
  useEventListener(target, 'pointermove', move)
  // useEventListener(target, 'pointerup', end)

  return {
    offsetX,
    positionNormalized,
    width: targetWidth,
  }
}
