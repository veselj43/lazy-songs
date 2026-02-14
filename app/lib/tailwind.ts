import { cnMerge, defaultConfig, type ClassValue, type TWMergeConfig } from 'tailwind-variants'

const colors = ['primary', 'success', 'warning', 'error', 'grey']

// https://github.com/dcastil/tailwind-merge/issues/297#issuecomment-1697743051
const tailwindMergeConfig: TWMergeConfig = {
  extend: {
    theme: {
      colors,
      borderColor: colors,
      gradientColorStops: colors,
    },
    classGroups: {
      'font-size': [
        { text: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subheadline', 'body', 'footnote', 'caption1', 'caption2'] },
      ],
      'font-weight': [{ font: ['regular'] }],
    },
  },
}

// https://www.tailwind-variants.org/docs/config#global-config
defaultConfig.twMergeConfig = tailwindMergeConfig

/**
 * Class concat and merge.
 * Originaly done externally by tailwind-merge and clsx.
 * Now tailwind-merge resolves both both out of the box.
 */
export const tvCn = (...inputs: ClassValue[]) => {
  return cnMerge(inputs)
}

/**
 * Does nothing, but allows prettier to format classes properly.
 */
export const tcf = (className: string) => className
