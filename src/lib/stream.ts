import { encodeUtf8 } from '@yume-chan/adb'
import type { ReadableStream as IReadableStream } from '@yume-chan/stream-extra/esm/types'
import { ZipReaderStream, type Entry } from '@zip.js/zip.js'

export const streamReadToBytes = async (reader: IReadableStream<Uint8Array>): Promise<Uint8Array> => {
  const chunks: Uint8Array[] = []
  let totalSize = 0

  for await (const chunk of reader) {
    chunks.push(chunk)
    totalSize += chunk.length
  }

  const content = new Uint8Array(totalSize)
  let offset = 0

  for (const chunk of chunks) {
    content.set(chunk, offset)
    offset += chunk.length
  }

  return content
}

export const streamFromString = (content: string): IReadableStream<Uint8Array> => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encodeUtf8(content))
      controller.close()
    },
  }) as unknown as IReadableStream<Uint8Array>
}

export const streamPipeUnzip = (reader: ReadableStream<Uint8Array>) => {
  const entries = reader.pipeThrough(new ZipReaderStream()) as any as AsyncIterable<
    Omit<Entry, 'getData'> & { readable?: IReadableStream<Uint8Array> }
  >

  return entries
}
