import { z } from 'zod'
import { schemaSongHash } from './beatSaber.interface'

export const schemaBeatSaverPlaylistSong = z.object({
  key: z.string(),
  hash: schemaSongHash,
  songName: z.string(),
})
export type BeatSaverPlaylistSong = z.infer<typeof schemaBeatSaverPlaylistSong>

export const schemaBeatSavePlaylist = z.object({
  playlistTitle: z.string(),
  playlistAuthor: z.string(),
  playlistDescription: z.string().optional(),
  image: z.string(),
  customData: z.object({
    syncURL: z.string(),
  }),
  songs: z.array(schemaBeatSaverPlaylistSong),
})
export type BeatSaverPlaylist = z.infer<typeof schemaBeatSavePlaylist>

export interface BeatSaverSongStream {
  blob: Blob
}
