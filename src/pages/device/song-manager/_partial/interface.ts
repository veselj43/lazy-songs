import type { AdbSyncEntry } from '@yume-chan/adb'
import type { BeatSaberSongInfo } from '~/service/beatSaber.interface'

export interface SongWithInfo {
  dirEntry: AdbSyncEntry
  info: BeatSaberSongInfo
  songTitle: string
}
