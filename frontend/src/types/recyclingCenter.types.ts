/**
 * Green Loop — Official Database-backed Recycling Center Entity
 * Represents records from Supabase table `public.recycling_centers`.
 */
export interface RecyclingCenter {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  contact_phone: string
  created_at?: string
  distanceKm?: number
}

export type RecyclingCenterFilter = 'all' | 'nearest' | 'coimbatore'
