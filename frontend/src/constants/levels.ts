import type { LevelTier } from '../types/common.types'

export const LEVELS: LevelTier[] = [
  { name: 'Eco Beginner', min: 0, max: 499, icon: 'leaf' },
  { name: 'Eco Explorer', min: 500, max: 1499, icon: 'tree' },
  { name: 'Green Champion', min: 1500, max: 4999, icon: 'recycle' },
  { name: 'Planet Guardian', min: 5000, max: Infinity, icon: 'verified' },
]

export const BADGES = [
  { icon: 'verified' as const, name: 'Trusted Seller', desc: '10+ verified sales' },
  { icon: 'recycle' as const, name: 'Recycling Champion', desc: '5+ verified recycling' },
  { icon: 'tree' as const, name: 'Community Contributor', desc: '3+ donations' },
]
