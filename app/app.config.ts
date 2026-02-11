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
  },
})
