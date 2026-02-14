import type { AdbSyncEntry } from '@yume-chan/adb'
import type { BeatSaberSongInfo } from './beatSaber.interface'

export interface SongWithInfo {
  dirEntry: AdbSyncEntry
  info: BeatSaberSongInfo
  songTitle: string
  hash: string
}
