import type { Adb } from '@yume-chan/adb'
import type { ShallowRef } from 'vue'
import type { AdbHandler } from '~/lib/webUsbAdb'

const KEY_ADB_HANDLER = 'adbHandler'

export const provideAdbHandler = (abdHandler: AdbHandler) => {
  provide(KEY_ADB_HANDLER, abdHandler)
}

export const injectAdbHandler = () => {
  const adbHandler = inject<AdbHandler>(KEY_ADB_HANDLER)

  if (!adbHandler) {
    throw Error(`Using ${injectAdbHandler.name} outside of provider`)
  }

  return adbHandler
}

const KEY_ADB_CURRENT = 'adbCurrent'

export const provideAdbCurrent = (abd: ShallowRef<Adb | undefined>) => {
  provide(KEY_ADB_CURRENT, abd)
}

export const injectAdbCurrent = () => {
  const adbHandler = inject<ShallowRef<Adb>>(KEY_ADB_CURRENT)

  if (!adbHandler) {
    throw Error(`Using ${injectAdbCurrent.name} outside of provider`)
  }

  return adbHandler
}
