import AppModalConfirm from './AppModalConfirm.vue'

export const useConfirm = () => {
  const overlay = useOverlay()
  const confirmModal = overlay.create(AppModalConfirm)

  const confirm = async (props: InstanceType<typeof AppModalConfirm>['$props']) => {
    const modal = confirmModal.open(props)
    const result = await modal.result
    return result
  }

  return {
    confirm,
  }
}
