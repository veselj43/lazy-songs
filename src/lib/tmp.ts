import { ref } from 'vue'
import { tryCatch } from '~/lib/error'

const usbDevicesData = await useAsyncData<USBDevice[]>(() => window.navigator.usb.getDevices())

const device = ref<USBDevice | null>(null)
const mtpInterfaceNumber = ref<number | null>(null)
const mtpOutEndpoint = ref<USBEndpoint | null>(null)
const mtpInEndpoint = ref<USBEndpoint | null>(null)

const usbDeviceAdd = async () => {
  try {
    device.value = await window.navigator.usb.requestDevice({
      filters: [{}],
    })
    await usbDevicesData.refresh()
    if (device.value) {
      await openAndInspectDevice(device.value)
    }
  } catch (error) {
    console.error('Error selecting device:', error)
  }
}

const selectAndConnect = async (deviceSelected: USBDevice) => {
  device.value = deviceSelected
  await openAndInspectDevice(device.value)
}

const openAndInspectDevice = async (deviceToOpen: USBDevice) => {
  const { error } = await tryCatch(deviceToOpen.open())

  if (error) {
    console.error('Error opening device:', error)
    return
  }

  console.log('Device opened:', deviceToOpen)
  console.log('Device configurations:', deviceToOpen.configurations)

  deviceToOpen.configurations.forEach((config) => {
    config.interfaces.forEach((iface) => {
      console.log(`  Interface Number: ${iface.interfaceNumber}`)
      console.log(`  Interface Class: ${iface.alternate.interfaceClass}`)
      console.log(`  Interface Subclass: ${iface.alternate.interfaceSubclass}`)
      console.log(`  Interface Protocol: ${iface.alternate.interfaceProtocol}`)

      if (iface.interfaceNumber === 0) { // Zaměřujeme se na interfaceNumber 0
        mtpInterfaceNumber.value = iface.interfaceNumber
        iface.alternate.endpoints.forEach((endpoint) => {
          console.log(`    Endpoint Number: ${endpoint.endpointNumber}`)
          console.log(`    Endpoint Direction: ${endpoint.direction}`)
          console.log(`    Endpoint Type: ${endpoint.type}`)
          if (endpoint.type === 'bulk') {
            if (endpoint.direction === 'out' && !mtpOutEndpoint.value) {
              mtpOutEndpoint.value = endpoint
            } else if (endpoint.direction === 'in' && !mtpInEndpoint.value) {
              mtpInEndpoint.value = endpoint
            }
          }
        })
      }
    })
  })

  if (mtpInterfaceNumber.value !== null) {
    try {
      await deviceToOpen.claimInterface(mtpInterfaceNumber.value)
      console.log(`Interface ${mtpInterfaceNumber.value} claimed.`)
      if (mtpOutEndpoint.value && mtpInEndpoint.value) {
        await sendGetDeviceInfo();
      } else {
        console.warn('Could not find both IN and OUT bulk endpoints for MTP.');
      }
    } catch (claimError) {
      console.error('Error claiming interface:', claimError)
    }
  } else {
    console.warn('Could not find interface 0.');
  }
}

async function sendGetDeviceInfo() {
  if (!device.value || !mtpOutEndpoint.value || !mtpInEndpoint.value) {
    console.error('Device or MTP endpoints not initialized.');
    return;
  }

  // MTP GetDeviceInfo command (Operation Code: 0x1001, Parameter Count: 0)
  const command = new Uint8Array([
    0x01, 0x10, 0x00, 0x00, // Length (will be updated later)
    0x01, 0x00, 0x00, 0x00, // Transaction ID (can be 0 for now)
    0x01, 0x10, 0x00, 0x00, // Operation Code (GetDeviceInfo)
    0x00, 0x00, 0x00, 0x00  // Parameter 1 (none)
  ]);

  // Set the length of the command (including the length itself)
  const length = command.length;
  const lengthBytes = new Uint8Array([
    length & 0xFF,
    (length >> 8) & 0xFF,
    (length >> 16) & 0xFF,
    (length >> 24) & 0xFF
  ]);
  command.set(lengthBytes, 0);

  try {
    const result = await device.value.transferOut(mtpOutEndpoint.value.endpointNumber, command);
    console.log('GetDeviceInfo command sent:', result);
    if (result.status === 'ok') {
      // Now we need to read the response from the IN endpoint
      await readDeviceInfoResponse();
    }
  } catch (transferError) {
    console.error('Error sending GetDeviceInfo command:', transferError);
  }
}

async function readDeviceInfoResponse() {
  if (!device.value || !mtpInEndpoint.value) {
    console.error('Device or MTP IN endpoint not initialized.');
    return;
  }

  const bytesToRead = 1024; // Adjust as needed
  try {
    const result = await device.value.transferIn(mtpInEndpoint.value.endpointNumber, bytesToRead);
    console.log('GetDeviceInfo response received:', result);
    if (result.status === 'ok' && result.data) {
      // We need to parse the MTP response here
      const data = new DataView(result.data.buffer);
      const responseLength = data.getUint32(0, true);
      const responseCode = data.getUint32(8, true); // Operation Response Code

      console.log('Response Length:', responseLength);
      console.log('Response Code:', responseCode);

      // The actual device info will follow after the response code
      // We'll need to parse this based on the MTP specification
    }
  } catch (readError) {
    console.error('Error reading GetDeviceInfo response:', readError);
  }
}
