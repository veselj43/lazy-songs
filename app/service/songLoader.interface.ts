export interface SongLoaderSongData {
  directoryHash: number
  sha1: string // uppercase hash
  songDuration: number
}

export interface SongLoaderCachedSongData {
  [key: string]: SongLoaderSongData
}
