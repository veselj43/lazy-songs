import { UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { CellContext, HeaderContext } from '@tanstack/vue-table'

export const getTableSelectHeader =
  () =>
  ({ table }: HeaderContext<any, any>) =>
    h(UCheckbox, {
      modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'aria-label': 'Select all',
    })

export const getTableSelectCell =
  () =>
  ({ row }: CellContext<any, any>) =>
    h(UCheckbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
      'aria-label': 'Select row',
    })

export const getTableSelectColumn = <TData = unknown>(overrides?: Partial<TableColumn<TData>>): TableColumn<TData> => {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: getTableSelectHeader(),
    cell: getTableSelectCell(),
    ...overrides,
  }
}
