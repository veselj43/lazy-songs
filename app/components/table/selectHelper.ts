import { UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { CellContext, HeaderContext } from '@tanstack/vue-table'

export const getTableSelectHeader =
  () =>
  ({ table }: HeaderContext<any, any>) =>
    h(UCheckbox, {
      modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value) => table.toggleAllPageRowsSelected(!!(value as boolean | 'indeterminate')),
      'aria-label': 'Select all',
    })

export const getTableSelectCell =
  () =>
  ({ row }: CellContext<any, any>) =>
    h(UCheckbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (value) => row.toggleSelected(!!(value as boolean | 'indeterminate')),
      'aria-label': 'Select row',
    })

export const getTableSelectColumn = <TData = unknown>(overrides?: Partial<TableColumn<TData>>): TableColumn<TData> => {
  return {
    id: 'selected',
    filterFn: (row, col, filter) => {
      return filter && row.getIsSelected()
    },
    enableSorting: false,
    enableHiding: false,
    header: getTableSelectHeader(),
    cell: getTableSelectCell(),
    ...overrides,
  }
}
