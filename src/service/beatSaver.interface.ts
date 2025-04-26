import type { SongHash } from './beatSaber.interface'

export interface BeatSaverPlaylistSong {
  key: string
  hash: SongHash
  songName: string
}

export interface BeatSaverPlaylist {
  playlistTitle: string
  playlistAuthor: string
  playlistDescription: string
  image: string
  customData: {
    syncURL: string
  }
  songs: BeatSaverPlaylistSong[]
}

export interface BeatSaverSongStream {
  blob: Blob
}
