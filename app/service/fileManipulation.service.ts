export const fileReadFromInput = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', (e) => {
      const base64Data = e.target?.result
      if (!base64Data) {
        reject(new Error('No data read'))
        return
      }

      resolve(base64Data as string)
    })

    reader.addEventListener('error', (error) => {
      reject(error)
    })

    reader.readAsDataURL(file)
  })
}

export const fileDetectImageTypeFromBase64 = (base64String: string) => {
  // Odstraníme prefix Data URL, pokud existuje
  const base64Data = base64String.startsWith('data:') ? base64String.split(',')[1] : base64String

  // Převedeme Base64 na pole čísel (bytů)
  const byteString = atob(base64Data)
  const byteArray = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i)
  }

  if (
    byteArray[0] === 0x89 &&
    byteArray[1] === 0x50 &&
    byteArray[2] === 0x4e &&
    byteArray[3] === 0x47 &&
    byteArray[4] === 0x0d &&
    byteArray[5] === 0x0a &&
    byteArray[6] === 0x1a &&
    byteArray[7] === 0x0a
  ) {
    return 'image/png'
  } else if (
    byteArray[0] === 0xff &&
    byteArray[1] === 0xd8 &&
    byteArray[2] === 0xff &&
    (byteArray[3] === 0xe0 || byteArray[3] === 0xe1)
  ) {
    return 'image/jpeg'
  } else if (
    byteArray[0] === 0x47 &&
    byteArray[1] === 0x49 &&
    byteArray[2] === 0x46 &&
    byteArray[3] === 0x38 &&
    (byteArray[4] === 0x37 || byteArray[4] === 0x39) &&
    byteArray[5] === 0x61
  ) {
    return 'image/gif'
  } else if (byteString.startsWith('RIFF') && byteString.substring(8, 12) === 'WEBP') {
    return 'image/webp'
  }

  return
}

const BASE_64_SEP = 'base64,'

export const fileGetBase64ImgUrl = (base64?: string | null) => {
  if (!base64) return
  if (base64.startsWith('data:image')) return base64

  return `data:image/*;${BASE_64_SEP}` + base64
}

export function fileGetBase64Data(base64: undefined): undefined
export function fileGetBase64Data(base64: string): string
export function fileGetBase64Data(base64?: string) {
  if (!base64) return

  const fromIndex = base64.indexOf(BASE_64_SEP)
  if (fromIndex === -1) return base64

  return base64.substring(fromIndex + BASE_64_SEP.length)
}
