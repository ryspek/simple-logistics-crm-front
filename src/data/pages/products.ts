import { sleep } from '../../services/utils'
import { Product } from '../../pages/products/types'
import axiosInstance from '../../services/config/axiosConfig'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Product | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getProducts = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    const { isActive, search, page = 1, perPage = 10, sortBy, sortingOrder } = filters;
    const params = {
      isActive,
      search,
      page: page - 1,
      size: perPage,
      sort: sortingOrder ? `${sortBy},${sortingOrder}` : undefined
    };

    const response = await axiosInstance.get('/product', { params });
    const data = response.data;

    return {
      data: data.content,
      pagination: {
        page: data.number + 1,
        perPage: data.size,
        total: data.totalElements,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export const addProduct = async (product: Product) => {
    const response = await axiosInstance.post(
      '/product',
      product,
    )
    return response.data
}

export const updateProduct = async (product: Product) => {
    const response = await axiosInstance.put(
      '/product',
      product,
    )
    return response.data
}

export const removeProduct = async (product: Product) => {
  await sleep(1000)
}
