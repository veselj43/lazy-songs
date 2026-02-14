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
