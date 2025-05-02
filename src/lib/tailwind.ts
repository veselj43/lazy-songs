import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { defaultConfig } from 'tailwind-variants'

const colors = ['primary', 'success', 'warning', 'error', 'grey']

// https://github.com/dcastil/tailwind-merge/issues/297#issuecomment-1697743051
const tailwindMergeConfig: Parameters<typeof extendTailwindMerge>[0] = {
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

// https://github.com/dcastil/tailwind-merge/blob/v2.5.3/docs/configuration.md#extending-the-tailwind-merge-config
const customTwMerge = extendTailwindMerge(tailwindMergeConfig)

/**
 * - removes class conflicts - keeps the latest in given order (tailwind-merge)
 * - supports conditions (clsx)
 */
export const tvCn = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(inputs))
}

/**
 * Does nothing, but allows prettier to format classes properly.
 */
export const tcf = (className: string) => className
