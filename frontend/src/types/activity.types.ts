import type { IconName } from '../components/Icon'

export interface DailyMission {
  id: string
  icon: IconName
  title: string
  reward: number
  completed: boolean
  progress: number
  total: number
}

export interface ActivityFeedItem {
  id: string
  icon: IconName
  type: string
  desc: string
  time: string
  coins: number
}

export interface CoinTransaction {
  id: string
  type: 'earn' | 'spent' | string
  label?: string
  title?: string
  amount: number | string
  date?: string
  time?: string
  status?: string
}

export interface RecyclingCertificate {
  id: string
  title: string
  device: string
  serialNo: string
  recycler: string
  date: string
  materialsRecovered: string
  co2Saved: string
  greenCoinsAwarded: number
  verifier: string
}

export interface StreakDay {
  day: string
  done: boolean
}
