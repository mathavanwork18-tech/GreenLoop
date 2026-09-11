import { supabase } from '../../utils/supabase'
import type { RecyclingCenter } from '../../types/recyclingCenter.types'
import { calculateDistance } from '../../utils/distance'

/**
 * Validates coordinate numbers per WGS84 standards.
 * Latitude must be within [-90, 90], Longitude within [-180, 180].
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (isNaN(lat) || isNaN(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

export const recyclingCentersApi = {
  /**
   * Fetches official recycling centers from Supabase table `public.recycling_centers`.
   * Enforces data validation and duplicate protection by database ID.
   */
  async getRecyclingCenters(userCoords?: [number, number] | null): Promise<RecyclingCenter[]> {
    const { data, error } = await supabase
      .from('recycling_centers')
      .select('id, name, address, city, latitude, longitude, contact_phone, created_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('[Supabase Error] Failed to fetch recycling_centers:', error.message)
      throw new Error(error.message || 'Unable to load recycling centers.')
    }

    if (!data || !Array.isArray(data)) {
      return []
    }

    // Protection: Deduplicate by database ID and validate coordinates
    const seenIds = new Set<string>()
    const validCenters: RecyclingCenter[] = []

    for (const raw of data) {
      if (!raw || !raw.id) continue

      const idStr = String(raw.id)
      if (seenIds.has(idStr)) continue
      seenIds.add(idStr)

      const lat = Number(raw.latitude)
      const lng = Number(raw.longitude)

      // Skip invalid coordinates safely without crashing
      if (!isValidCoordinate(lat, lng)) {
        console.warn(`[Data Warning] Skipping recycling center "${raw.name}" due to invalid coordinates: (${raw.latitude}, ${raw.longitude})`)
        continue
      }

      let distanceKm: number | undefined
      if (userCoords && isValidCoordinate(userCoords[0], userCoords[1])) {
        distanceKm = calculateDistance(userCoords[0], userCoords[1], lat, lng)
      }

      validCenters.push({
        id: idStr,
        name: String(raw.name || 'Recycling Center').trim(),
        address: String(raw.address || '').trim(),
        city: String(raw.city || 'Coimbatore').trim(),
        latitude: lat,
        longitude: lng,
        contact_phone: String(raw.contact_phone || '').trim(),
        created_at: raw.created_at,
        distanceKm,
      })
    }

    return validCenters
  },

  /**
   * Returns a standard navigation URL directly to the center's exact coordinates.
   */
  getDirectionsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  },

  /**
   * Returns a sanitized tel: protocol link for immediate mobile calling.
   */
  getTelUrl(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
  },

  /**
   * Client-side search across center name, area, address, and city.
   */
  filterCentersByQuery(centers: RecyclingCenter[], query: string): RecyclingCenter[] {
    const q = query.trim().toLowerCase()
    if (!q) return centers

    return centers.filter(center => {
      const nameMatch = center.name.toLowerCase().includes(q)
      const addressMatch = center.address.toLowerCase().includes(q)
      const cityMatch = center.city.toLowerCase().includes(q)
      return nameMatch || addressMatch || cityMatch
    })
  }
}

export default recyclingCentersApi
