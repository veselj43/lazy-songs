export type SongHash = string

export interface BeatSaberPlaylistSong {
  hash: SongHash
  songName: string
}

export interface BeatSaberPlaylist {
  playlistDescription: string | null
  playlistAuthor: string | null
  playlistTitle: string
  songs: BeatSaberPlaylistSong[]
  imageString: string
}

export interface BeatSaberSongInfo {
  _version: string
  _songName: string
  _songSubName: string
  _songAuthorName: string
  _levelAuthorName: string
  _beatsPerMinute: number
  _shuffle: number
  _shufflePeriod: number
  _previewStartTime: number
  _previewDuration: string
  _songFilename: string
  _coverImageFilename: string
  _environmentName: string
  _songTimeOffset: number
}
