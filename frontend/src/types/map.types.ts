import type { IconName } from '../components/Icon'

export type PartnerType = 'all' | 'recycler' | 'shop' | 'repair'

export interface EcosystemPartner {
  id: string
  type: 'recycler' | 'shop' | 'repair'
  name: string
  services: string[]
  categories: string[]
  distance: number
  rating: number
  reviews: number
  open: boolean
  hours: string
  verified: boolean
  address: string
  lat: number
  lng: number
  icon: IconName
  phone?: string
}

export interface PickupScheduleForm {
  facilityId: string
  facilityName: string
  date: string
  timeSlot: string
  items: string
  weightEstimate: string
  address: string
  specialInstructions?: string
}
