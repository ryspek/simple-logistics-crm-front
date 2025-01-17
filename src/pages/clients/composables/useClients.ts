import { Ref, ref, unref, watch } from 'vue'
import {
  getClients,
  updateClient,
  addClient,
  removeClient,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/clients'
import { Client } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'id', sortingOrder: 'asc' })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useClients = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const clients = ref<Client[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getClients({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    clients.value = data

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

    clients,

    fetch,

    async add(client: Client) {
      isLoading.value = true
      await addClient(client)
      await fetch()
      isLoading.value = false
    },

    async update(client: Client) {
      isLoading.value = true
      await updateClient(client)
      await fetch()
      isLoading.value = false
    },

    async remove(client: Client) {
      isLoading.value = true
      await removeClient(client)
      await fetch()
      isLoading.value = false
    },
  }
}
