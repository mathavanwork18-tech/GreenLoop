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
    label: 'Local Shop / Company',
    description: 'Refurbishment shops and companies purchasing e-waste, managing bulk materials, and orders',
    badge: 'Business',
  },
]

