/** Helper function for possible logger */
export const loggerPush = (...logSegments: [string, ...string[]]): void => {
  console.debug(logSegments.join(' '))
}
