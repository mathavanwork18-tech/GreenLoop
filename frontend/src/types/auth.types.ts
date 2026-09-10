export type Role = 'GENERAL_USER' | 'LOCAL_SHOP' | 'RECYCLER' | 'ADMIN'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  role: Role
  city: string
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
