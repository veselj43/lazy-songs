import { describe, expect, it } from 'vitest'
import { streamFromString, streamPipeUnzip, streamReadToBytes } from '../../app/lib/stream'

describe('song file streams', () => {
  it('encodes non-ASCII song metadata as UTF-8', async () => {
    const content = '{"_songName":"Příliš žluťoučký 🎵"}'
    const bytes = await streamReadToBytes(streamFromString(content))

    expect(new TextDecoder().decode(bytes)).toBe(content)
  })

  it('extracts deflated song files from a chunked ZIP stream', async () => {
    // Fixed archive generated independently with Python zipfile, using ZIP_DEFLATED.
    const archive = Uint8Array.from(
      Buffer.from(
        'UEsDBBQAAAAIAAAAIVDvzZQRJwAAACUAAAAIAAAASW5mby5kYXSrVoovzs9L90vMTVWyUnJJLUjNS0nNS65UKM7Nz05VKEktLlGqBQBQSwMEFAAAAAgAAAAhUEO/pqMEAAAAAgAAAAoAAABFeHBlcnQuZGF0q64FAFBLAQIUAxQAAAAIAAAAIVDvzZQRJwAAACUAAAAIAAAAAAAAAAAAAACAAQAAAABJbmZvLmRhdFBLAQIUAxQAAAAIAAAAIVBDv6ajBAAAAAIAAAAKAAAAAAAAAAAAAACAAU0AAABFeHBlcnQuZGF0UEsFBgAAAAACAAIAbgAAAHkAAAAAAA==',
        'base64',
      ),
    )
    const reader = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let offset = 0; offset < archive.length; offset += 13) {
          controller.enqueue(archive.subarray(offset, offset + 13))
        }
        controller.close()
      },
    })
    const files: Record<string, string> = {}

    for await (const entry of streamPipeUnzip(reader)) {
      if (entry.readable) {
        files[entry.filename] = new TextDecoder().decode(await streamReadToBytes(entry.readable))
      }
    }

    expect(files).toEqual({
      'Info.dat': '{"_songName":"Dependency smoke test"}',
      'Expert.dat': '{}',
    })
  })
})
