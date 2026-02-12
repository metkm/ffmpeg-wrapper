export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brown',
      neutral: 'neutral',
    },
    select: {
      slots: {
        base: 'w-full',
      },
    },
    inputNumber: {
      slots: {
        base: 'w-full',
        root: 'w-full',
      },
    },
    checkbox: {
      slots: {
        root: 'min-w-0',
        description: 'truncate',
        wrapper: 'min-w-0',
      },
    },
    button: {
      slots: {
        base: 'rounded-4xl',
      },
    },
    formField: {
      slots: {
        help: 'text-warning-500',
      },
    },
    tooltip: {
      slots: {
        text: 'max-4-xl text-clip',
        content: 'max-w-4xl h-auto',
      },
    },
  },
})
