import { LinuxFileType } from '@yume-chan/adb'

export type FileType = 'dir' | 'file' | 'link'

export const getFileType = (fileTypeNumber: number): FileType | undefined => {
  switch (fileTypeNumber) {
    case LinuxFileType.Directory:
      return 'dir'
    case LinuxFileType.File:
      return 'file'
    case LinuxFileType.Link:
      return 'link'
  }
}

export interface DirEntry {
  name: string
  type: FileType
  size: bigint
}
