import type { Role } from '../types/auth.types'

export const ROLES: { id: Role; label: string; description: string; badge: string }[] = [
  {
    id: 'citizen',
    label: 'General User',
    description: 'Citizens who post e-waste, sell unwanted electronics, and find recycling drop-off points',
    badge: 'Citizen',
  },
  {
    id: 'shop',
    label: 'Local Shop',
    description: 'Neighborhood refurbishment and repair shops managing collections, pickups, and inventory',
    badge: 'Business',
  },
  {
    id: 'company',
    label: 'Company',
    description: 'Enterprise e-waste recyclers managing bulk collection manifests, industrial processing, and compliance',
    badge: 'Enterprise',
  },
]

