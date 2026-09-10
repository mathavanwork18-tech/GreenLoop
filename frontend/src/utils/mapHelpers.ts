import L from 'leaflet'

/**
 * Validates if coordinates are legitimate decimal latitude/longitude numbers.
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (isNaN(lat) || isNaN(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

/**
 * Creates compact Green Loop styled DivIcons for map markers.
 */
export function createMapIcon(emoji: string, categoryClass: string, isSelected = false): L.DivIcon {
  return L.divIcon({
    className: `gl-compact-pin ${categoryClass} ${isSelected ? 'selected' : ''}`,
    html: `
      <div class="gl-pin-badge">
        <span class="gl-pin-icon">${emoji}</span>
      </div>
      <div class="gl-pin-arrow"></div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  })
}

/**
 * Creates Green Loop Eco Cluster Marker for grouped nearby pins
 */
export function createClusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 38 : count < 50 ? 44 : 50
  return L.divIcon({
    className: 'gl-cluster-pin',
    html: `
      <div class="gl-cluster-badge" style="width: ${size}px; height: ${size}px;">
        <span class="gl-cluster-count">${count}</span>
        <span class="gl-cluster-eco">♻️</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

/**
 * User location marker with live GPS indicator
 */
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'gl-user-pin',
    html: `
      <div class="gl-user-pulse"></div>
      <div class="gl-user-dot">
        <span>📍</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

/**
 * Simple grid-based clustering algorithm for coordinate points
 */
export interface ClusterGroup<T> {
  id: string
  lat: number
  lng: number
  items: T[]
}

export function clusterPoints<T extends { latitude?: number; longitude?: number; lat?: number; lng?: number }>(
  points: T[],
  zoomLevel: number
): { clusters: ClusterGroup<T>[]; singles: T[] } {
  // If zoomed in close (zoom >= 14), do not cluster
  if (zoomLevel >= 14 || points.length <= 3) {
    return { clusters: [], singles: points }
  }

  // Grid size decreases as zoom increases
  const gridSize = zoomLevel <= 11 ? 0.045 : zoomLevel === 12 ? 0.022 : 0.012
  const grid: Record<string, T[]> = {}

  points.forEach(p => {
    const lat = p.latitude ?? p.lat
    const lng = p.longitude ?? p.lng
    if (lat === undefined || lng === undefined) return

    const gridX = Math.floor(lat / gridSize)
    const gridY = Math.floor(lng / gridSize)
    const key = `${gridX}_${gridY}`

    if (!grid[key]) grid[key] = []
    grid[key].push(p)
  })

  const clusters: ClusterGroup<T>[] = []
  const singles: T[] = []

  Object.entries(grid).forEach(([key, group]) => {
    if (group.length > 1) {
      // Calculate average centroid
      const totalLat = group.reduce((sum, item) => sum + (item.latitude ?? item.lat ?? 0), 0)
      const totalLng = group.reduce((sum, item) => sum + (item.longitude ?? item.lng ?? 0), 0)
      clusters.push({
        id: `cluster_${key}`,
        lat: totalLat / group.length,
        lng: totalLng / group.length,
        items: group,
      })
    } else if (group.length === 1) {
      singles.push(group[0])
    }
  })

  return { clusters, singles }
}

/**
 * Default fallback coordinates: Coimbatore City Center (RS Puram)
 */
export const DEFAULT_COORDS: [number, number] = [11.0168, 76.9558]
