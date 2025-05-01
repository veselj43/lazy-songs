import type { HeaderContext } from '@tanstack/vue-table'
import SortButton from './SortButton.vue'

export const getHeaderSort =
  (label: string) =>
  <TData, TValue = unknown>(cell: HeaderContext<TData, TValue>) => {
    return h(SortButton, {
      label,
      sortDirection: cell.column.getIsSorted(),
      onSort: cell.column.getToggleSortingHandler(),
    })
  }
