import type { Role } from '../types/auth.types'

export const ROLES: { id: Role; label: string; description: string }[] = [
  { id: 'GENERAL_USER', label: 'General User', description: 'Sell, donate, recycle devices and earn Green Coins' },
  { id: 'LOCAL_SHOP', label: 'Local Repair Shop', description: 'Offer repair services and harvest spare components' },
  { id: 'RECYCLER', label: 'Recycling Company', description: 'Authorized heavy e-waste processing and certificate issuance' },
  { id: 'ADMIN', label: 'Admin', description: 'System governance, verification audits, and dispute resolution' },
]
