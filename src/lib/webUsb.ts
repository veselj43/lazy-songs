'use client'

export interface DeviceWithMtp {
  device: USBDevice
  iface: USBInterface
  endpointIn: USBEndpoint
  endpointOut: USBEndpoint
}

export const deviceGetMtpEndpoints = (device: USBDevice): DeviceWithMtp | undefined => {
  console.log(device)

  // console.log(
  //   device.configuration?.interfaces?.map((i) => ({
  //     interfaceClass: i.alternate.interfaceClass,
  //     interfaceProtocol: i.alternate.interfaceProtocol,
  //     interfaceSubclass: i.alternate.interfaceSubclass,
  //   })),
  // )

  if (!device.configuration) {
    console.error('No device configuration')
    return
  }

  const iface = device.configuration.interfaces.find((iface) => iface.alternate.interfaceSubclass === 138)

  if (!iface) {
    console.error('Interface not found')
    return
  }

  const endpointOut = iface.alternate.endpoints.find(
    (endpoint) => endpoint.type === 'bulk' && endpoint.direction === 'out',
  )
  const endpointIn = iface.alternate.endpoints.find(
    (endpoint) => endpoint.type === 'bulk' && endpoint.direction === 'in',
  )

  if (!endpointIn) {
    console.error('Endpoint type "in" not found. Endpoints:', iface.alternate.endpoints)
    return
  }
  if (!endpointOut) {
    console.error('Endpoint type "out" not found. Endpoints:', iface.alternate.endpoints)
    return
  }

  return {
    device,
    iface,
    endpointIn,
    endpointOut,
  }
}

async function deviceResponseReadCode(deviceWithMtp: DeviceWithMtp) {
  const bytesToRead = 512

  try {
    const result = await deviceWithMtp.device.transferIn(deviceWithMtp.endpointIn.endpointNumber, bytesToRead)
    console.log('GetDeviceInfo response received:', result)
    if (result.status === 'ok' && result.data) {
      // We need to parse the MTP response here
      const dataView = result.data
      const responseLength = dataView.getUint32(0, true)
      const responseCode = dataView.getUint32(8, true) // Operation Response Code

      console.log('Response Length:', responseLength)
      console.log('Response Code:', responseCode)

      // The actual device info will follow after the response code
      // We'll need to parse this based on the MTP specification
    }
  } catch (readError) {
    console.error('Error reading GetDeviceInfo response:', readError)
  }
}

async function deviceResponseReadGetPropList(deviceWithMtp: DeviceWithMtp) {
  const bytesToRead = 2048

  try {
    const result = await deviceWithMtp.device.transferIn(deviceWithMtp.endpointIn.endpointNumber, bytesToRead)
    console.log('GetDevicePropList response received:', result)
    if (result.status === 'ok' && result.data) {
      const dataView = result.data
      const responseLength = dataView.getUint32(0, true)
      const responseCode = dataView.getUint32(8, true)

      console.log('Response Length:', responseLength)
      console.log('Response Code:', responseCode)

      if (responseCode === 0x1002) {
        // Response_OK for GetDevicePropList
        // Za kódem odpovědi následuje počet podporovaných vlastností
        const propertyCount = dataView.getUint32(12, true)
        console.log('Number of supported properties:', propertyCount)

        // A pak následují samotné kódy vlastností (každý je Uint32)
        for (let i = 0; i < propertyCount; i++) {
          const propertyCode = dataView.getUint32(16 + i * 4, true)
          console.log(`Supported Property Code ${i + 1}: 0x${propertyCode.toString(16).padStart(4, '0')}`)
        }
      }
    }
  } catch (readError) {
    console.error('Error reading GetDevicePropList response:', readError)
  }
}

async function deviceResponseReadStorageInfo(deviceWithMtp: DeviceWithMtp) {
  const bytesToRead = 512

  try {
    const result = await deviceWithMtp.device.transferIn(deviceWithMtp.endpointIn.endpointNumber, bytesToRead)
    console.log('GetStorageInfo response received:', result)
    if (result.status === 'ok' && result.data) {
      const dataView = new DataView(result.data.buffer)
      const responseLength = dataView.getUint32(0, true)
      const responseCode = dataView.getUint32(8, true)

      console.log('Response Length:', responseLength)
      console.log('Response Code:', responseCode)

      // Pokud je kód odpovědi 0x1002 (Response_OK),
      // za ním by mělo následovat pole StorageID.
      if (responseCode === 0x1002 && responseLength > 12) {
        const storageCount = dataView.getUint32(12, true)
        console.log('Number of storage units:', storageCount)
        for (let i = 0; i < storageCount; i++) {
          const storageID = dataView.getUint32(16 + i * 4, true)
          console.log(`Storage ID ${i + 1}: 0x${storageID.toString(16).padStart(8, '0')}`)
        }
      }
    }
  } catch (readError) {
    console.error('Error reading GetStorageInfo response:', readError)
  }
}

interface OperationInfo {
  commandCode: Uint8Array // length 4
  responseHandler: (deviceWithMtp: DeviceWithMtp) => Promise<void>
}

type OperationKey = 'GetDeviceInfo' | 'GetDevicePropDesc' | 'GetDevicePropList' | 'GetStorageInfo'

const operationMap: Record<OperationKey, OperationInfo> = {
  GetDeviceInfo: {
    commandCode: Uint8Array.from([0x01, 0x10, 0x00, 0x00]),
    responseHandler: deviceResponseReadCode,
  },
  GetDevicePropDesc: {
    commandCode: Uint8Array.from([0x05, 0x10, 0x00, 0x00]),
    responseHandler: deviceResponseReadCode,
  },
  GetDevicePropList: {
    commandCode: Uint8Array.from([0x02, 0x10, 0x00, 0x00]),
    responseHandler: deviceResponseReadGetPropList,
  },
  GetStorageInfo: {
    commandCode: Uint8Array.from([0x04, 0x10, 0x00, 0x00]),
    responseHandler: deviceResponseReadStorageInfo,
  },
}

export interface DeviceSendCommandOptions {
  operationCode: OperationKey
}

export const deviceSendCommand = async (deviceWithMtp: DeviceWithMtp, { operationCode }: DeviceSendCommandOptions) => {
  const { device } = deviceWithMtp

  if (!device.opened) {
    await device.open()
    await device.claimInterface(deviceWithMtp.iface.interfaceNumber)
  }

  const operation = operationMap[operationCode]

  // MTP GetDeviceInfo command (Operation Code: 0x1001, Parameter Count: 0)
  const command = Uint8Array.from([
    ...[0x01, 0x10, 0x00, 0x00], // Length (will be updated later)
    ...[0x01, 0x00, 0x00, 0x00], // Transaction ID (can be 0 for now)
    ...operation.commandCode,
    ...[0x00, 0x00, 0x00, 0x00], // Parameter 1 (none)
  ])

  // Set the length of the command (including the length itself)
  const length = command.length
  const lengthBytes = Uint8Array.from([
    length & 0xff,
    (length >> 8) & 0xff,
    (length >> 16) & 0xff,
    (length >> 24) & 0xff,
  ])
  command.set(lengthBytes, 0)

  try {
    const result = await device.transferOut(deviceWithMtp.endpointOut.endpointNumber, command)
    console.log(`Command ${operationCode} sent:`, command, result)
    if (result.status === 'ok') {
      await operation.responseHandler(deviceWithMtp)
    }
  } catch (transferError) {
    console.error('Error sending GetDeviceInfo command:', transferError)
  }
}

export const deviceSendMinimalCommand = async (deviceWithMtp: DeviceWithMtp) => {
  const { device, endpointOut, iface } = deviceWithMtp

  if (!device.opened) {
    await device.open()
    await device.claimInterface(iface.interfaceNumber)
  }

  // Minimal MTP Operation Request (Length: 8, Type: 1)
  const command = new Uint8Array([
    0x08,
    0x00,
    0x00,
    0x00, // Length (8 bytes)
    0x01,
    0x00,
    0x00,
    0x00, // Message Type (Operation Request)
  ])

  try {
    console.log('transferOut', endpointOut.endpointNumber, command)
    const result = await device.transferOut(endpointOut.endpointNumber, command)
    console.log('Minimal command sent:', result)
    // We don't expect a response here, just want to see if it disconnects
  } catch (transferError) {
    console.error('Error sending minimal command:', transferError)
  }
}
