export default defineAppConfig({
  icon: {
    fallbackToApi: false,
  },
  ui: {
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
  },
})
