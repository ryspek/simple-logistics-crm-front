import { sleep } from '../../services/utils'
import { Client } from '../../pages/clients/types'
import axiosInstance from '../../services/config/axiosConfig'
import router from '../../router'


export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Client | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getClients = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    const { isActive, search, page = 1, perPage = 10, sortBy, sortingOrder } = filters;
    const params = {
      isActive,
      search,
      page: page - 1,
      size: perPage,
      sort: sortingOrder ? `${sortBy},${sortingOrder}` : undefined
    };

    const response = await axiosInstance.get('/client', { params });
    const data = response.data.result;

    return {
      data: data.content,
      pagination: {
        page: data.number + 1,
        perPage: data.size,
        total: data.totalElements,
      },
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    if (error.response && error.response.status === 401) {
      await router.push('/auth/login')
    }
    throw error;
  }
}

export const addClient = async (client: Client) => {
  const response = await axiosInstance.post(
    '/client',
    client,
  )
  return response.data.result
}

export const updateClient = async (client: Client) => {
  const response = await axiosInstance.put(
    '/client',
    client,
  )
  return response.data.result
}

export const removeClient = async (client: Client) => {
  await sleep(1000)
}
