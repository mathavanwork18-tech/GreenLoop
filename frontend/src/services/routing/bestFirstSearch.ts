export interface RouteTarget {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'center' | 'citizen_listing' | 'shop'
  isVerified?: boolean
  urgency?: number // 0 to 1
  address?: string
  phone?: string
}

export interface OptimalRouteResult {
  target: RouteTarget
  distanceKm: number
  heuristicScore: number
  estimatedMinutes: number
  directionsUrl: string
}

/**
 * Haversine distance formula between two lat/lng points in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Best-First Search Routing Algorithm
 * Evaluates candidate targets with priority function:
 * f(n) = distance_weight * h(n) - eco_bonus * verified_center_weight - urgency_factor
 * where h(n) = haversineDistance(current_loc, target_loc)
 */
export function computeBestFirstRoute(
  currentLat: number,
  currentLng: number,
  candidates: RouteTarget[],
  options?: {
    distanceWeight?: number
    ecoBonus?: number
    urgencyWeight?: number
    cityAverageSpeedKmh?: number
  }
): OptimalRouteResult[] {
  const distanceWeight = options?.distanceWeight ?? 1.0
  const ecoBonus = options?.ecoBonus ?? 1.5
  const urgencyWeight = options?.urgencyWeight ?? 1.2
  const speed = options?.cityAverageSpeedKmh ?? 25 // 25 km/h urban traffic in Coimbatore

  const evaluated: OptimalRouteResult[] = candidates.map((target) => {
    const h = haversineDistance(currentLat, currentLng, target.latitude, target.longitude)
    const verifiedBonus = target.isVerified ? 1.0 : 0.0
    const urgency = target.urgency ?? 0.0

    // f(n) evaluation: lower score is higher priority
    const score = distanceWeight * h - ecoBonus * verifiedBonus - urgencyWeight * urgency
    const minutes = Math.max(2, Math.round((h / speed) * 60))

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${target.latitude},${target.longitude}`

    return {
      target,
      distanceKm: h,
      heuristicScore: score,
      estimatedMinutes: minutes,
      directionsUrl,
    }
  })

  // Priority queue ordering: lowest f(n) first
  return evaluated.sort((a, b) => a.heuristicScore - b.heuristicScore)
}
