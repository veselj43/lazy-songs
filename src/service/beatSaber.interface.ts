import { z } from 'zod'

export const schemaSongHash = z.string()
export type SongHash = z.infer<typeof schemaSongHash>

export const schemaBeatSabePlaylistSong = z.object({
  hash: schemaSongHash,
  songName: z.string(),
})
export type BeatSaberPlaylistSong = z.infer<typeof schemaBeatSabePlaylistSong>

export const schemaBeatSaberPlaylist = z.object({
  playlistDescription: z.string().optional().nullable(),
  playlistAuthor: z.string().optional().nullable(),
  playlistTitle: z.string().min(1),
  songs: z.array(schemaBeatSabePlaylistSong),
  imageString: z.string().optional().nullable(),
})
export type BeatSaberPlaylist = z.infer<typeof schemaBeatSaberPlaylist>

export const schemaBeatSaberSongInfo = z.object({
  _version: z.string(),
  _songName: z.string(),
  _songSubName: z.string(),
  _songAuthorName: z.string(),
  _levelAuthorName: z.string(),
  _beatsPerMinute: z.number(),
  _shuffle: z.number(),
  _shufflePeriod: z.number(),
  _previewStartTime: z.number(),
  _previewDuration: z.string(),
  _songFilename: z.string(),
  _coverImageFilename: z.string(),
  _environmentName: z.string(),
  _songTimeOffset: z.number(),
})
export type BeatSaberSongInfo = z.infer<typeof schemaBeatSaberSongInfo>
