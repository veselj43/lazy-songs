/**
 * Path management available in browser
 */

export const PATH_SEP = '/'
const PATH_DIR_UP = '..'

const pathNormalizeUpDirs = (pathSegments: string[]): string[] => {
  const result = [...pathSegments]

  for (let i = 1; i < result.length; ) {
    if (i > 0 && result[i] === PATH_DIR_UP) {
      result.splice(i - 1, 2)
      i--
    } else {
      i++
    }
  }

  return result
}

export const pathJoin = (...paths: [string, ...string[]]): string => {
  const isPathAbsolute = paths[0].startsWith(PATH_SEP)
  const pathSegments = paths.join(PATH_SEP).split(PATH_SEP).filter(Boolean)
  const subPathsNormalized = pathNormalizeUpDirs(pathSegments).join(PATH_SEP)

  return (isPathAbsolute ? PATH_SEP : '') + subPathsNormalized
}

export const fileNameNoExt = (filename: string) => {
  const parts = filename.split('.')
  parts.pop()
  return parts.join('.')
}
