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

export const DEFAULT_COORDS: [number, number] = [11.0168, 76.9558] // Coimbatore Central (RS Puram)

/**
 * Clean SVG icon markup for the official Green Loop Recycling Center marker.
 * Strictly 100% SVG — zero emojis.
 */
const RECYCLING_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 19H4.8a1.8 1.8 0 0 1-1.57-.88 1.79 1.79 0 0 1 0-1.78L7.2 9.5"/>
    <path d="M11 19h8.2a1.8 1.8 0 0 0 1.56-.89 1.78 1.78 0 0 0 0-1.77l-1.23-2.12"/>
    <path d="m14 16-3 3 3 3"/>
    <path d="M8.3 13.6 5.5 9.5a1.78 1.78 0 0 1 0-1.77l3.96-6.85A1.83 1.83 0 0 1 11.02 0h4.08a1.83 1.83 0 0 1 1.56.89l3.96 6.85a1.78 1.78 0 0 1 0 1.77L19.16 12"/>
    <path d="m17 4 3 3-3 3"/>
  </svg>
`

/**
 * Creates an official Green Loop Recycling Center Leaflet DivIcon.
 * Uses consistent emerald theme and clear SVG glyphs.
 */
export function createRecyclingCenterIcon(isSelected = false): L.DivIcon {
  return L.divIcon({
    className: `gl-compact-pin pin-recycler ${isSelected ? 'selected' : ''}`,
    html: `
      <div class="gl-pin-badge recycler-badge">
        <span class="gl-pin-svg">${RECYCLING_SVG}</span>
      </div>
      <div class="gl-pin-arrow recycler-arrow"></div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42],
  })
}

/**
 * Creates user location marker with live pulse indicator (SVG, zero emoji).
 */
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'gl-user-pin',
    html: `
      <div class="gl-user-pulse"></div>
      <div class="gl-user-dot">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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
        <span class="gl-cluster-svg">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 19H4.8a1.8 1.8 0 0 1-1.57-.88 1.79 1.79 0 0 1 0-1.78L7.2 9.5"/>
            <path d="M11 19h8.2a1.8 1.8 0 0 0 1.56-.89 1.78 1.78 0 0 0 0-1.77l-1.23-2.12"/>
            <path d="m14 16-3 3 3 3"/>
          </svg>
        </span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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

  Object.entries(grid).forEach(([key, items]) => {
    if (items.length > 1) {
      const avgLat = items.reduce((acc, curr) => acc + (curr.latitude ?? curr.lat ?? 0), 0) / items.length
      const avgLng = items.reduce((acc, curr) => acc + (curr.longitude ?? curr.lng ?? 0), 0) / items.length
      clusters.push({
        id: `cluster-${key}`,
        lat: avgLat,
        lng: avgLng,
        items,
      })
    } else if (items.length === 1) {
      singles.push(items[0])
    }
  })

  return { clusters, singles }
}
