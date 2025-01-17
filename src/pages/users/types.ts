export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_MODERATOR'

export type User = {
  id: number
  fullname: string
  email: string
  username: string
  role: UserRole
  active: boolean
  password: string
}
