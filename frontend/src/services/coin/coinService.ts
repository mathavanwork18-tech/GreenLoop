import type { AppRole } from '../role/roleService'

export interface CoinTransaction {
  id: string
  userId: string
  transactionType: 'registration_bonus' | 'daily_login' | 'reward' | 'redeem' | 'bonus'
  amount: number
  description: string
  rewardDate?: string
  createdAt: string
}

export interface DailyLoginResult {
  awarded: boolean
  coinsAwarded: number
  totalCoins: number
  streak: number
  longestStreak: number
  message: string
}

/**
 * Resolves the current calendar date in India (Asia/Kolkata) formatted as 'YYYY-MM-DD'.
 * The Indian calendar day begins at 12:00 AM IST.
 */
export function getTodayIndiaDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date)
}

/**
 * Resolves yesterday's calendar date in India (Asia/Kolkata) formatted as 'YYYY-MM-DD'.
 */
export function getYesterdayIndiaDate(todayIstString?: string): string {
  const todayStr = todayIstString || getTodayIndiaDate()
  const [y, m, d] = todayStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().split('T')[0]
}

/**
 * Storage helpers for isolated user persistence.
 */
function getUserCoinsKey(userId: string): string {
  return `gl_coins_${userId}`
}

function getUserTxsKey(userId: string): string {
  return `gl_txs_${userId}`
}

export const coinService = {
  /**
   * Retrieves the current coin balance for an authenticated user.
   */
  async getCoinBalance(userId: string): Promise<number> {
    if (!userId) return 0
    const stored = localStorage.getItem(getUserCoinsKey(userId))
    return stored ? Number(stored) : 0
  },

  /**
   * Retrieves the list of coin transactions for an authenticated user.
   */
  async getCoinHistory(userId: string): Promise<CoinTransaction[]> {
    if (!userId) return []
    const stored = localStorage.getItem(getUserTxsKey(userId))
    return stored ? JSON.parse(stored) : []
  },

  /**
   * Awards the registration bonus ONCE to a newly registered user.
   */
  async awardRegistrationBonus(userId: string, role: AppRole): Promise<{ awarded: boolean; coins: number }> {
    if (!userId || role === 'admin') {
      return { awarded: false, coins: 0 }
    }

    const bonusAmount = role === 'citizen' ? 50 : 100
    const todayIst = getTodayIndiaDate()

    const history = await this.getCoinHistory(userId)
    const hasRegBonus = history.some((tx) => tx.transactionType === 'registration_bonus')
    if (hasRegBonus) {
      const currentBalance = await this.getCoinBalance(userId)
      return { awarded: false, coins: currentBalance }
    }

    const newTx: CoinTransaction = {
      id: 'tx_reg_' + Date.now(),
      userId,
      transactionType: 'registration_bonus',
      amount: bonusAmount,
      description: `${role === 'citizen' ? 'Citizen' : role === 'shop' ? 'Local Shop' : 'Company'} Registration Welcome Bonus`,
      rewardDate: todayIst,
      createdAt: new Date().toISOString(),
    }

    const currentCoins = await this.getCoinBalance(userId)
    const updatedBalance = currentCoins + bonusAmount

    localStorage.setItem(getUserCoinsKey(userId), String(updatedBalance))
    const updatedTxs = [newTx, ...history]
    localStorage.setItem(getUserTxsKey(userId), JSON.stringify(updatedTxs))

    return { awarded: true, coins: updatedBalance }
  },

  /**
   * Processes the Daily Login Reward (+25 coins once per Indian calendar day).
   */
  async processDailyLoginReward(userId: string): Promise<DailyLoginResult> {
    if (!userId) {
      return {
        awarded: false,
        coinsAwarded: 0,
        totalCoins: 0,
        streak: 1,
        longestStreak: 1,
        message: 'No authenticated user session',
      }
    }

    const todayIst = getTodayIndiaDate()
    const yesterdayIst = getYesterdayIndiaDate(todayIst)

    const profileCoins = Number(localStorage.getItem(getUserCoinsKey(userId)) || '0')
    const currentStreak = Number(localStorage.getItem(`gl_streak_${userId}`) || '1')
    const longestStreak = Number(localStorage.getItem(`gl_longest_streak_${userId}`) || '1')
    const lastLoginDate = localStorage.getItem(`gl_last_login_${userId}`) || ''

    if (lastLoginDate === todayIst) {
      return {
        awarded: false,
        coinsAwarded: 0,
        totalCoins: profileCoins,
        streak: Math.max(1, currentStreak),
        longestStreak: Math.max(1, longestStreak, currentStreak),
        message: 'Daily reward already claimed today (IST). Come back tomorrow at 12:00 AM IST!',
      }
    }

    let newStreak = 1
    if (lastLoginDate === yesterdayIst) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }

    const newLongestStreak = Math.max(longestStreak, newStreak)
    const rewardCoins = 25
    const newTotalCoins = profileCoins + rewardCoins

    const newTx: CoinTransaction = {
      id: 'tx_daily_' + Date.now(),
      userId,
      transactionType: 'daily_login',
      amount: rewardCoins,
      description: `Daily Login Reward (Day ${newStreak} Streak) [${todayIst} IST]`,
      rewardDate: todayIst,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(getUserCoinsKey(userId), String(newTotalCoins))
    localStorage.setItem(`gl_streak_${userId}`, String(newStreak))
    localStorage.setItem(`gl_longest_streak_${userId}`, String(newLongestStreak))
    localStorage.setItem(`gl_last_login_${userId}`, todayIst)

    const history = await this.getCoinHistory(userId)
    localStorage.setItem(getUserTxsKey(userId), JSON.stringify([newTx, ...history]))

    return {
      awarded: true,
      coinsAwarded: rewardCoins,
      totalCoins: newTotalCoins,
      streak: newStreak,
      longestStreak: newLongestStreak,
      message: `Daily reward claimed! +${rewardCoins} Green Coins credited. Current streak: ${newStreak} days.`,
    }
  },

  /**
   * Resets and clears all cached state on logout.
   */
  clearUserState(userId: string) {
    if (!userId) return
    localStorage.removeItem(getUserCoinsKey(userId))
    localStorage.removeItem(getUserTxsKey(userId))
    localStorage.removeItem(`gl_streak_${userId}`)
    localStorage.removeItem(`gl_longest_streak_${userId}`)
    localStorage.removeItem(`gl_last_login_${userId}`)
  },
}
