import { Ref, ref, unref, watch } from 'vue'
import {
  getDebtors,
  updateDebtor,
  addDebtor,
  removeDebtor,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/debtors'
import { Debtor } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'id', sortingOrder: 'asc' })
const makeFiltersRef = () => ref<Partial<Filters>>({ search: '', selectedClients: [], selectedStatuses: []})

export const useDebtors = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const debtors = ref<Debtor[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getDebtors({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    debtors.value = data

    ignoreUpdates(() => {
      pagination.value = newPagination
    })

    isLoading.value = false
  }

  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  watch(
    filters,
    () => {
      pagination.value.page = 1
      fetch()
    },
    { deep: true },
  )

  fetch()

  return {
    isLoading,

    filters,
    sorting,
    pagination,

    debtors,

    fetch,

    async add(debtor: Debtor) {
      isLoading.value = true
      await addDebtor(debtor)
      await fetch()
      isLoading.value = false
    },

    async update(debtor: Debtor) {
      isLoading.value = true
      await updateDebtor(debtor)
      await fetch()
      isLoading.value = false
    },

    async remove(debtor: Debtor) {
      isLoading.value = true
      await removeDebtor(debtor)
      await fetch()
      isLoading.value = false
    },
  }
}
