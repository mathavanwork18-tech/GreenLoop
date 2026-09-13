export type Role = 'citizen' | 'shop' | 'company' | 'admin' | 'GENERAL_USER' | 'LOCAL_SHOP' | 'COMPANY' | 'RECYCLER' | 'ADMIN'

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
