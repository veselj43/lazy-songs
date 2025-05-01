import type { BeatSaberPlaylist } from './beatSaber.interface'
import type { BeatSaverPlaylist } from './beatSaver.interface'
import { pathJoin } from './path.service'

export function getBeatSaberSongInfoPath(songDirPath: string) {
  return pathJoin(songDirPath, 'Info.dat')
}

export const beatSaberPlaylistFromBeatSaverPlaylist = (playlistData: BeatSaverPlaylist): BeatSaberPlaylist => {
  return {
    playlistAuthor: playlistData.playlistAuthor,
    playlistDescription: playlistData.playlistDescription,
    playlistTitle: playlistData.playlistTitle,
    imageString: playlistData.image,
    songs: playlistData.songs,
  }
}

const allowedChars = {
  alphanum: /[a-zA-Z0-9]/,
  special: '()[]-_ &'.split(''),
}

const mapToSafeChar = (char: string): string => {
  if (allowedChars.alphanum.test(char)) return char
  if (allowedChars.special.includes(char)) return char

  return ''
}

export function sanitizeFileName(name: string): string {
  return name.split('').map(mapToSafeChar).join('')
}

export const BEAT_SABER_PLAYLIST_EXT = '.json'

export const beatSaberPlaylistGetPathFromName = (name: string) => {
  return `${sanitizeFileName(name)}${BEAT_SABER_PLAYLIST_EXT}`
}
