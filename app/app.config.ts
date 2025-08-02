export default defineAppConfig({
  ui: {
    colors: {
      primary: 'purple',
      neutral: 'zinc',
    },
    formField: {
      slots: {
        root: 'border p-4 border-muted rounded-lg',
      },
    },
    button: {
      slots: {
        base: 'rounded-full',
      },
    },
  },
})
