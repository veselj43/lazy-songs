import type { AdbSyncEntry } from '@yume-chan/adb'
import type { BeatSaberPlaylist } from '~/service/beatSaber.interface'

export interface PlaylistWithInfo {
  dirEntry: AdbSyncEntry
  info: BeatSaberPlaylist
  playlistTitle: string
}
