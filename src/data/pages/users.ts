import { sleep } from '../../services/utils'
import { User } from '../../pages/users/types'
import usersDb from './users-db.json'
import axiosInstance from "../../services/config/axiosConfig";
import router from '../../router'

export const users = usersDb as User[]

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof User | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getUsers = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    const { isActive, search, page = 1, perPage = 10, sortBy, sortingOrder } = filters;
    const params = {
      isActive,
      search,
      page: page - 1,
      size: perPage,
      sort: sortingOrder ? `${sortBy},${sortingOrder}` : undefined
    };

    const response = await axiosInstance.get('/user', { params });
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
    console.error('Error fetching users:', error);
    if (error.response && error.response.status === 401) {
      await router.push('/auth/login')
    }
    throw error;
  }
}

export const addUser = async (user: User) => {
  const response = await axiosInstance.post(
    '/user',
    user,
  )
  return response.data.result
}

export const updateUser = async (user: User) => {
  const response = await axiosInstance.put(
    '/user',
    user,
  )
  return response.data.result
}

export const removeUser = async (user: User) => {
  await sleep(1000)
}
