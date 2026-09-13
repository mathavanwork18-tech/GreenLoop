import { supabase } from '../../utils/supabase'
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

    // 1. Try fetching from public.profiles
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data && typeof data.coins === 'number') {
        localStorage.setItem(getUserCoinsKey(userId), String(data.coins))
        return data.coins
      }
    } catch {
      // Graceful fallback to client storage
    }

    const stored = localStorage.getItem(getUserCoinsKey(userId))
    return stored ? Number(stored) : 0
  },

  /**
   * Retrieves the list of coin transactions for an authenticated user.
   */
  async getCoinHistory(userId: string): Promise<CoinTransaction[]> {
    if (!userId) return []

    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped: CoinTransaction[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          transactionType: d.transaction_type,
          amount: d.amount,
          description: d.description,
          rewardDate: d.reward_date,
          createdAt: d.created_at,
        }))
        localStorage.setItem(getUserTxsKey(userId), JSON.stringify(mapped))
        return mapped
      }
    } catch {}

    const stored = localStorage.getItem(getUserTxsKey(userId))
    return stored ? JSON.parse(stored) : []
  },

  /**
   * Awards the registration bonus ONCE to a newly registered user.
   * Citizen: +50 coins
   * Local Shop: +100 coins
   * Company: +100 coins
   * Admin: 0 coins
   */
  async awardRegistrationBonus(userId: string, role: AppRole): Promise<{ awarded: boolean; coins: number }> {
    if (!userId || role === 'admin') {
      return { awarded: false, coins: 0 }
    }

    const bonusAmount = role === 'citizen' ? 50 : 100
    const todayIst = getTodayIndiaDate()

    // 1. Check if registration bonus was already awarded in Supabase
    try {
      const { data: existing } = await supabase
        .from('coin_transactions')
        .select('id')
        .match({ user_id: userId, transaction_type: 'registration_bonus' })
        .maybeSingle()

      if (existing) {
        const currentBalance = await this.getCoinBalance(userId)
        return { awarded: false, coins: currentBalance }
      }
    } catch {}

    // Check client-side isolated records
    const history = await this.getCoinHistory(userId)
    const hasRegBonus = history.some((tx) => tx.transactionType === 'registration_bonus')
    if (hasRegBonus) {
      const currentBalance = await this.getCoinBalance(userId)
      return { awarded: false, coins: currentBalance }
    }

    // Award bonus
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

    // Update local cache
    localStorage.setItem(getUserCoinsKey(userId), String(updatedBalance))
    const updatedTxs = [newTx, ...history]
    localStorage.setItem(getUserTxsKey(userId), JSON.stringify(updatedTxs))

    // Persist to Supabase if supported
    try {
      await supabase.from('coin_transactions').insert({
        user_id: userId,
        transaction_type: newTx.transactionType,
        amount: newTx.amount,
        description: newTx.description,
        reward_date: newTx.rewardDate,
      })
    } catch {}

    try {
      await supabase
        .from('profiles')
        .update({ coins: updatedBalance })
        .eq('id', userId)
    } catch {}

    return { awarded: true, coins: updatedBalance }
  },

  /**
   * Processes the Daily Login Reward (+25 coins once per Indian calendar day).
   * - Timezone: Asia/Kolkata
   * - Streak progression:
   *   - Consecutive day: streak + 1, longest_streak = max(longest_streak, streak)
   *   - Missed day: streak = 1
   *   - Same day login: 0 coins, streak unchanged
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

    // 1. Fetch current profile state
    let profileCoins = 0
    let currentStreak = 0
    let longestStreak = 0
    let lastLoginDate = ''

    try {
      const { data } = await supabase
        .from('profiles')
        .select('coins, current_streak, longest_streak, last_login_date')
        .eq('id', userId)
        .maybeSingle()

      if (data) {
        profileCoins = data.coins || 0
        currentStreak = data.current_streak || 0
        longestStreak = data.longest_streak || 0
        lastLoginDate = data.last_login_date || ''
      }
    } catch {}

    // Fallback to isolated client records if profile values aren't initialized
    if (!profileCoins) {
      profileCoins = Number(localStorage.getItem(getUserCoinsKey(userId)) || '0')
    }
    const storedStreak = Number(localStorage.getItem(`gl_streak_${userId}`) || '0')
    if (!currentStreak && storedStreak) {
      currentStreak = storedStreak
    }
    const storedLastLogin = localStorage.getItem(`gl_last_login_${userId}`) || ''
    if (!lastLoginDate && storedLastLogin) {
      lastLoginDate = storedLastLogin
    }

    // 2. Check if already claimed today in IST
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

    // Also verify against transactions for idempotency
    try {
      const { data: todayTx } = await supabase
        .from('coin_transactions')
        .select('id')
        .match({ user_id: userId, transaction_type: 'daily_login', reward_date: todayIst })
        .maybeSingle()

      if (todayTx) {
        localStorage.setItem(`gl_last_login_${userId}`, todayIst)
        return {
          awarded: false,
          coinsAwarded: 0,
          totalCoins: profileCoins,
          streak: Math.max(1, currentStreak),
          longestStreak: Math.max(1, longestStreak, currentStreak),
          message: 'Daily reward already claimed today (IST).',
        }
      }
    } catch {}

    // 3. Compute new streak
    let newStreak = 1
    if (lastLoginDate === yesterdayIst) {
      // Consecutive day login!
      newStreak = currentStreak + 1
    } else {
      // First day or missed day -> resets to 1
      newStreak = 1
    }

    const newLongestStreak = Math.max(longestStreak, newStreak)
    const rewardCoins = 25
    const newTotalCoins = profileCoins + rewardCoins

    // 4. Record new transaction
    const newTx: CoinTransaction = {
      id: 'tx_daily_' + Date.now(),
      userId,
      transactionType: 'daily_login',
      amount: rewardCoins,
      description: `Daily Login Reward (Day ${newStreak} Streak) [${todayIst} IST]`,
      rewardDate: todayIst,
      createdAt: new Date().toISOString(),
    }

    // Save to isolated client storage
    localStorage.setItem(getUserCoinsKey(userId), String(newTotalCoins))
    localStorage.setItem(`gl_streak_${userId}`, String(newStreak))
    localStorage.setItem(`gl_longest_streak_${userId}`, String(newLongestStreak))
    localStorage.setItem(`gl_last_login_${userId}`, todayIst)

    const history = await this.getCoinHistory(userId)
    localStorage.setItem(getUserTxsKey(userId), JSON.stringify([newTx, ...history]))

    // Persist to Supabase
    try {
      await supabase.from('coin_transactions').insert({
        user_id: userId,
        transaction_type: newTx.transactionType,
        amount: newTx.amount,
        description: newTx.description,
        reward_date: newTx.rewardDate,
      })
    } catch {}

    try {
      await supabase
        .from('profiles')
        .update({
          coins: newTotalCoins,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_login_date: todayIst,
        })
        .eq('id', userId)
    } catch {}

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
   * Resets and clears all cached state on logout to prevent cross-user contamination.
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
