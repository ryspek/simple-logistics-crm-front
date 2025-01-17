import { Ref, ref, unref, watch } from 'vue'
import {
  getCargos,
  updateCargo,
  addCargo,
  removeCargo,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/cargos'
import { Cargo } from '../types'
import { watchIgnorable } from '@vueuse/core'


const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'id', sortingOrder: 'asc' })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useCargos = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const cargos = ref<Cargo[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getCargos({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    cargos.value = data

    ignoreUpdates(() => {
      pagination.value = newPagination
    })

    isLoading.value = false
  }

  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  watch(
    filters,
    () => {
      // Reset pagination to first page when filters changed
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

    cargos,

    fetch,

    async add(cargo: Cargo) {
      isLoading.value = true
      await addCargo(cargo)
      await fetch()
      isLoading.value = false
    },

    async update(cargo: Cargo) {
      isLoading.value = true
      await updateCargo(cargo)
      await fetch()
      isLoading.value = false
    },

    async remove(cargo: Cargo) {
      isLoading.value = true
      await removeCargo(cargo)
      await fetch()
      isLoading.value = false
    },
  }
}
