/**
 * Path management available in browser
 */

export const PATH_SEP = '/'

export const pathJoin = (...paths: [string, ...string[]]): string => {
  const isPathAbsolute = paths[0].startsWith(PATH_SEP)
  const subPathsNormalized = paths
    .map((subPath) => subPath.split(PATH_SEP).filter(Boolean).join(PATH_SEP))
    .join(PATH_SEP)

  return (isPathAbsolute ? PATH_SEP : '') + subPathsNormalized
}

export const fileNameNoExt = (filename: string) => {
  const parts = filename.split('.')
  parts.pop()
  return parts.join('.')
}
