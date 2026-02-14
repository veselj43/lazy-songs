import type { BeatSaverSongStream } from './beatSaver.interface'

export const BEAT_SAVER_CONFIG = {
  baseUrl: 'https://r2cdn.beatsaver.com',
  songFileExtension: 'zip',
} as const

export function beatSaverGetSongUrlFromHash(songHash: string) {
  return `${BEAT_SAVER_CONFIG.baseUrl}/${songHash}.${BEAT_SAVER_CONFIG.songFileExtension}`
}

export const beatSaverGetSongStream = async (songHash: string): Promise<BeatSaverSongStream | undefined> => {
  const url = beatSaverGetSongUrlFromHash(songHash)
  const res = await $fetch.raw<Blob>(url, { responseType: 'blob' })
  if (!res._data) return

  return res._data
    ? {
        blob: res._data,
      }
    : undefined
}
