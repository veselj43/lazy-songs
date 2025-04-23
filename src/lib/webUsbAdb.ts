import { Adb, AdbDaemonTransport, type AdbSync } from '@yume-chan/adb'
import AdbWebCredentialStore from '@yume-chan/adb-credential-web'
import { AdbDaemonWebUsbDevice, AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb'
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
        console.warn('The device is already in use by another program. Please close the program and try again.')
      }

      throw error
    }

    const credentialStore: AdbWebCredentialStore = new AdbWebCredentialStore('LazySongs')

    const timeout = setTimeout(() => {
      console.log('Accept authorization request on your device.')
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
      throw transportErr
    }

    const adb = new Adb(transport)
    return adb
  }
}

export const adbSyncPathExists = async (sync: AdbSync, path: string) => {
  const { error: statErr } = await tryCatch(sync.stat(path))
  return !statErr
}
