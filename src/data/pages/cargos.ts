import { sleep } from '../../services/utils'
import { Cargo } from '../../pages/cargos/types'
import axiosInstance from '../../services/config/axiosConfig'
import router from '../../router'


export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Cargo | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getCargos = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    const { isActive, search, page = 1, perPage = 10, sortBy, sortingOrder } = filters;
    const params = {
      isActive,
      search,
      page: page - 1,
      size: perPage,
      sort: sortingOrder ? `${sortBy},${sortingOrder}` : undefined
    };

    const response = await axiosInstance.get('/cargo', { params });
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
    console.error('Error fetching cargos:', error);
    if (error.response && error.response.status === 401) {
      await router.push('/auth/login')
    }
    throw error;
  }
}

export const addCargo = async (cargo: Cargo) => {
  const response = await axiosInstance.post(
    '/cargo',
    cargo,
  )
  return response.data.result
}

export const updateCargo = async (cargo: Cargo) => {
  const response = await axiosInstance.put(
    '/cargo',
    cargo,
  )
  return response.data.result
}

export const removeCargo = async (cargo: Cargo) => {
  await sleep(1000)
}
