import { pathJoin } from './path.service'

export function getBeatSaberSongInfoPath(songDirPath: string) {
  return pathJoin(songDirPath, 'Info.dat')
}
