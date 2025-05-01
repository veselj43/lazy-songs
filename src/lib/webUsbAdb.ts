import { Adb, AdbDaemonTransport, type AdbSync } from '@yume-chan/adb'
import AdbWebCredentialStore from '@yume-chan/adb-credential-web'
import { AdbDaemonWebUsbDevice, AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb'
import { loggerPush } from '~/service/logger.service'
import { tryCatch } from './error'

export interface AdbDeviceUiItem {
  device: AdbDaemonWebUsbDevice
  name: string
  serial: string
}

const adbDeviceMapToUi = (device: AdbDaemonWebUsbDevice): AdbDeviceUiItem => {
  return {
    device: markRaw(device),
    name: device.name,
    serial: device.serial,
  }
}

export const adbDeviceGetKey = (device: AdbDaemonWebUsbDevice) => device.serial

interface AdbDeviceConnectOptions {
  onAuthenticateStart?(): void
  onAuthenticateEnd?(error?: any): void
}

export class AdbHandler {
  static init(_adbManager: AdbDaemonWebUsbDeviceManager): AdbHandler
  static init(): AdbHandler | undefined
  static init(_adbManager?: AdbDaemonWebUsbDeviceManager) {
    const adbManager = _adbManager ?? AdbDaemonWebUsbDeviceManager.BROWSER

    if (adbManager) {
      return new AdbHandler(adbManager)
    }
  }

  private constructor(private readonly manager: AdbDaemonWebUsbDeviceManager) {}

  async deviceGetList(): Promise<AdbDeviceUiItem[]> {
    const data = await this.manager.getDevices()
    return data.map(adbDeviceMapToUi)
  }

  async deviceRequest(options?: AdbDaemonWebUsbDeviceManager.RequestDeviceOptions) {
    const device = await this.manager.requestDevice(options)
    return device && adbDeviceMapToUi(device)
  }

  async deviceConnect(device: AdbDaemonWebUsbDevice, options: AdbDeviceConnectOptions) {
    const { data: connection, error } = await tryCatch(device.connect())
    const deviceKey = adbDeviceGetKey(device)

    if (error) {
      if (error instanceof AdbDaemonWebUsbDevice.DeviceBusyError) {
        loggerPush('Error: The device is already in use by another program. Please close the program and try again.')
      }

      throw error
    }

    const credentialStore: AdbWebCredentialStore = new AdbWebCredentialStore('LazySongs')

    const timeout = setTimeout(() => {
      loggerPush('Authenticate requested')
      options.onAuthenticateStart?.()
    }, 500)

    const { data: transport, error: transportErr } = await tryCatch(
      AdbDaemonTransport.authenticate({
        serial: deviceKey,
        connection,
        credentialStore,
      }),
    )

    clearTimeout(timeout)
    options.onAuthenticateEnd?.(transportErr)

    if (transportErr) {
      loggerPush('Authenticate error:', transportErr.name, transportErr.message)
      throw transportErr
    }

    const adb = new Adb(transport)
    return adb
  }
}

export class AdbSingleton {
  private static instance: AdbSingleton

  static async from(adb: Adb) {
    if (AdbSingleton.instance) {
      if (AdbSingleton.instance.adb.serial === adb.serial) {
        return AdbSingleton.instance
      }

      await AdbSingleton.instance.adb.close()
    }

    return new AdbSingleton(adb)
  }

  private syncSingleton: Promise<AdbSync> | undefined

  private constructor(readonly adb: Adb) {}

  sync(): Promise<AdbSync> {
    if (!this.syncSingleton) {
      this.syncSingleton = this.adb.sync()
    }
    return this.syncSingleton
  }

  /** Call only with using syntax */
  async useSync() {
    const sync = await this.adb.sync()

    const pathStat = async (path: string) => {
      const { data: statData } = await tryCatch(sync.lstat(path))
      return statData
    }

    const pathExists = async (path: string) => {
      const stat = await pathStat(path)
      return !!stat
    }

    return {
      sync,
      pathExists,
      pathStat,
      [Symbol.asyncDispose]: async () => {
        await sync.dispose()
      },
    }
  }
}
