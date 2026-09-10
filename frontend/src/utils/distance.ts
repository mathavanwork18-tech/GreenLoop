/**
 * Haversine Distance Calculation Utility
 * Accurately calculates the great-circle distance between two points on Earth
 * using latitude and longitude coordinates with robust input validation.
 */

const EARTH_RADIUS_KM = 6371 // Radius of the Earth in kilometers

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculates the distance between two coordinate pairs in kilometers using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers rounded to 2 decimal places, or 9999 on invalid input
 */
export function calculateDistance(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (
    lat1 === undefined || lat1 === null || isNaN(lat1) ||
    lon1 === undefined || lon1 === null || isNaN(lon1) ||
    lat2 === undefined || lat2 === null || isNaN(lat2) ||
    lon2 === undefined || lon2 === null || isNaN(lon2)
  ) {
    return 9999
  }

  // Exact same point
  if (lat1 === lat2 && lon1 === lon2) return 0

  // Validate geographical bounds
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) return 9999
  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) return 9999

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const radLat1 = toRadians(lat1)
  const radLat2 = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = EARTH_RADIUS_KM * c

  return Math.round(distance * 100) / 100
}

/**
 * Formats a distance in kilometers for display (e.g. "850 m" if < 1km, or "2.4 km").
 */
export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null || isNaN(km) || km >= 9999) {
    return '--'
  }
  if (km < 1) {
    const meters = Math.round(Math.max(0, km) * 1000)
    return `${meters} m`
  }
  return `${km.toFixed(1)} km`
}
