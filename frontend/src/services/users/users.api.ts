import type { User } from '../../types/user.types'
import { MOCK_USER } from '../../data/mockData'

export const usersApi = {
  async getCurrentUser(): Promise<User> {
    await new Promise(r => setTimeout(r, 200))
    const stored = localStorage.getItem('gl_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {}
    }
    return MOCK_USER as unknown as User
  },

  async updateCurrentUser(partialUser: Partial<User>): Promise<User> {
    await new Promise(r => setTimeout(r, 450))
    const current = await this.getCurrentUser()
    const updated: User = { ...current, ...partialUser }
    localStorage.setItem('gl_user', JSON.stringify(updated))
    return updated
  },

  async updateCoins(amount: number): Promise<User> {
    const current = await this.getCurrentUser()
    const newCoins = Math.max(0, current.greenCoins + amount)

    let level = 'Eco Beginner'
    let levelIcon = 'leaf'
    let levelMin = 0
    let levelMax = 499

    if (newCoins >= 5000) {
      level = 'Planet Guardian'
      levelIcon = 'verified'
      levelMin = 5000
      levelMax = 99999
    } else if (newCoins >= 1500) {
      level = 'Green Champion'
      levelIcon = 'recycle'
      levelMin = 1500
      levelMax = 4999
    } else if (newCoins >= 500) {
      level = 'Eco Explorer'
      levelIcon = 'tree'
      levelMin = 500
      levelMax = 1499
    }

    const updated: User = {
      ...current,
      greenCoins: newCoins,
      level,
      levelIcon,
      levelMin,
      levelMax,
    }
    localStorage.setItem('gl_user', JSON.stringify(updated))
    return updated
  }
}
