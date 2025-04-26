import { useAdbStore } from '~/store/adb'

export const middlewareAdbDeviceCheck = () => {
  if (import.meta.server) return

  const pinia = usePinia()
  const storeAdb = useAdbStore(pinia)

  if (!storeAdb.deviceAdb) {
    return navigateTo('/')
  }
}
