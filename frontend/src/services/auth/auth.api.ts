import type { LoginCredentials, RegisterPayload } from '../../types/auth.types'
import type { User } from '../../types/user.types'
import { MOCK_USER } from '../../data/mockData'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    await new Promise(r => setTimeout(r, 600))
    const user: User = {
      ...MOCK_USER,
      email: credentials.email,
    }
    localStorage.setItem('gl_user', JSON.stringify(user))
    return user
  },

  async register(payload: RegisterPayload): Promise<User> {
    await new Promise(r => setTimeout(r, 800))
    const newUser: User = {
      ...MOCK_USER,
      id: 'u_' + Date.now(),
      name: payload.name,
      email: payload.email || '',
      phone: payload.phone,
      role: payload.role,
      city: payload.city,
      greenCoins: 100, // Welcome bonus
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      transactions: 0,
      isVerified: true,
    }
    localStorage.setItem('gl_user', JSON.stringify(newUser))
    return newUser
  },

  async logout(): Promise<void> {
    await new Promise(r => setTimeout(r, 200))
    localStorage.removeItem('gl_user')
  }
}
