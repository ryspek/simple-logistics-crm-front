import { sleep } from '../../services/utils'
import { Debtor } from '../../pages/debtors/types'
import axiosInstance from '../../services/config/axiosConfig'
import router from '../../router'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Debtor | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  search: string
  dateFrom: Date
  dateTo: Date
  selectedClients: number[]
  selectedStatuses: string[]
}

export const getDebtors = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    const { search, dateFrom, dateTo, selectedClients = [], selectedStatuses = [], page = 1, perPage = 10, sortBy, sortingOrder } = filters;
    const params = {
      search,
      dateFrom,
      dateTo,
      selectedClients: selectedClients?.join(','),
      selectedStatuses: selectedStatuses?.join(','),
      page: page - 1,
      size: perPage,
      sort: sortingOrder ? `${sortBy},${sortingOrder}` : undefined
    };

    const response = await axiosInstance.get('/debtor', { params });
    const data = response.data.result;
    1
    return {
      data: data.content,
      pagination: {
        page: data.number + 1,
        perPage: data.size,
        total: data.totalElements,
      },
    };
  } catch (error) {
    console.error('Error fetching debtors:', error);
    if (error.response && error.response.status === 401) {
      await router.push('/auth/login')
    }
    throw error;
  }
}

export const addDebtor = async (debtor: Debtor) => {
  const response = await axiosInstance.post(
    '/debtor',
    debtor,
  )
  return response.data.result
}

export const updateDebtor = async (debtor: Debtor) => {
  const response = await axiosInstance.put(
    '/debtor',
    debtor,
  )
  return response.data.result
}

export const removeDebtor = async (debtor: Debtor) => {
  await sleep(1000)
}
