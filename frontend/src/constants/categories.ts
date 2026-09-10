import type { CategoryOption, EcoAction } from '../types/common.types'
import type { IconName } from '../components/Icon'

export const CATEGORIES: CategoryOption[] = [
  { id: 'mobile', label: 'Mobile', icon: 'phone' },
  { id: 'laptop', label: 'Laptop', icon: 'laptop' },
  { id: 'tablet', label: 'Tablet', icon: 'tablet' },
  { id: 'battery', label: 'Battery', icon: 'battery' },
  { id: 'accessories', label: 'Accessories', icon: 'headphones' },
]

export const PURPOSE_OPTIONS: { id: string; icon: IconName; label: EcoAction; color: string; bg: string }[] = [
  { id: 'sell', icon: 'coin', label: 'Sell', color: '#059669', bg: '#d1fae5' },
  { id: 'donate', icon: 'gift', label: 'Donate', color: '#2563eb', bg: '#dbeafe' },
  { id: 'recycle', icon: 'recycle', label: 'Recycle', color: '#059669', bg: '#d1fae5' },
  { id: 'exchange', icon: 'refresh', label: 'Exchange', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'repair', icon: 'repair', label: 'Repair', color: '#d97706', bg: '#fffbeb' },
]

export const CONDITIONS = [
  { id: 'flawless', label: 'Flawless', desc: 'Like new, no scratches' },
  { id: 'good', label: 'Good', desc: 'Minor cosmetic signs of use' },
  { id: 'fair', label: 'Fair', desc: 'Noticeable wear or minor screen scuffs' },
  { id: 'broken', label: 'Broken / For Parts', desc: 'Dead motherboard or cracked display' },
  { id: 'hazmat', label: 'Hazmat (Swollen Battery)', desc: 'Immediate safe neutralization required' },
]
