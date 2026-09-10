import type { DailyMission, ActivityFeedItem, CoinTransaction, RecyclingCertificate } from '../../types/activity.types'
import { MOCK_MISSIONS, MOCK_ACTIVITY, MOCK_COIN_HISTORY } from '../../data/mockData'

export const activityApi = {
  async getMissions(): Promise<DailyMission[]> {
    await new Promise(r => setTimeout(r, 150))
    return MOCK_MISSIONS as unknown as DailyMission[]
  },

  async getActivityStream(): Promise<ActivityFeedItem[]> {
    await new Promise(r => setTimeout(r, 150))
    return MOCK_ACTIVITY as unknown as ActivityFeedItem[]
  },

  async getCoinTransactions(): Promise<CoinTransaction[]> {
    await new Promise(r => setTimeout(r, 150))
    try {
      const custom: CoinTransaction[] = JSON.parse(localStorage.getItem('gl_custom_coin_history') || '[]')
      return [...custom, ...(MOCK_COIN_HISTORY as unknown as CoinTransaction[])]
    } catch {
      return MOCK_COIN_HISTORY as unknown as CoinTransaction[]
    }
  },

  async recordCoinTransaction(tx: Omit<CoinTransaction, 'id' | 'time' | 'status'>): Promise<CoinTransaction> {
    const newTx: CoinTransaction = {
      ...tx,
      id: 'c_' + Date.now(),
      time: 'Just now',
      status: 'Completed',
    }
    const existing: CoinTransaction[] = JSON.parse(localStorage.getItem('gl_custom_coin_history') || '[]')
    localStorage.setItem('gl_custom_coin_history', JSON.stringify([newTx, ...existing]))
    return newTx
  },

  async getCertificates(): Promise<RecyclingCertificate[]> {
    await new Promise(r => setTimeout(r, 200))
    return [
      {
        id: 'GL-REC-2025-0841',
        title: 'Lithium Battery Neutralization Certificate',
        device: 'Dell 6-Cell Laptop Battery Pack',
        serialNo: 'BAT-DL-88291',
        recycler: 'GreenCycle Recyclers Pvt Ltd (TNPCB Auth)',
        date: '28 Aug 2025',
        materialsRecovered: 'Lithium 120g • Cobalt 85g • Nickel 240g',
        co2Saved: '14.2 kg CO₂e',
        greenCoinsAwarded: 150,
        verifier: 'Er. S. Narayanan (TNPCB Inspector)'
      },
      {
        id: 'GL-REC-2025-0722',
        title: 'Consumer Electronics Recovery Certificate',
        device: 'Samsung 32" LED Monitor & Cables',
        serialNo: 'MON-SM-44102',
        recycler: 'EcoSafe Recyclers SIPCOT',
        date: '14 Aug 2025',
        materialsRecovered: 'Copper 380g • Aluminum 1.1kg • ABS Plastic 2.4kg',
        co2Saved: '28.4 kg CO₂e',
        greenCoinsAwarded: 150,
        verifier: 'K. Meenakshi (E-Waste Compliance)'
      }
    ]
  }
}
