// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  // Your custom configs here
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['src/**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/html-self-closing': [
        'warn',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/no-multiple-template-root': 'off',
      'vue/v-on-event-hyphenation': 'off',
    },
  },
  {
    files: ['src/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
])
