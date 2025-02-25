// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
)
  .overrideRules({
    '@stylistic/brace-style': ['warn', '1tbs'],
  })
