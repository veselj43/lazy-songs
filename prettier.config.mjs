/** @type {import('prettier').Config} */
export default {
  bracketSpacing: true,
  jsxSingleQuote: true,
  printWidth: 120,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  tailwindFunctions: ['tv', 'cn', 'tcf'],
}
