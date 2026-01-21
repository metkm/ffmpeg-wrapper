export default defineAppConfig({
  ui: {
    colors: {
      primary: 'light-brown',
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
    button: {
      slots: {
        base: 'rounded-full',
      },
    },
  },
})
