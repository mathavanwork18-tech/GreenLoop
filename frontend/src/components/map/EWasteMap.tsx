import { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './EWasteMap.css'

import { recyclingCentersApi, isValidCoordinate } from '../../services/recycling/recyclingCenters.api'
import { postsApi } from '../../services/posts/posts.api'
import type { RecyclingCenter } from '../../types/recyclingCenter.types'
import type { Post } from '../../types/post.types'

import {
  createRecyclingCenterIcon,
  createUserLocationIcon,
  createClusterIcon,
  clusterPoints,
  DEFAULT_COORDS,
} from '../../utils/mapHelpers'

import MapSearch from './MapSearch'
import MapFilters, { type MapCategoryFilter } from './MapFilters'
import ItemPreviewCard, { type SelectedMapEntity } from './ItemPreviewCard'
import Icon from '../Icon'

// Map Zoom & Pan State Controller
function MapEventHandler({
  onZoomChange,
  targetCenter,
}: {
  onZoomChange: (zoom: number) => void
  targetCenter?: [number, number] | null
}) {
  const map = useMap()

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })

  useEffect(() => {
    if (targetCenter && isValidCoordinate(targetCenter[0], targetCenter[1])) {
      map.flyTo(targetCenter, Math.max(map.getZoom(), 13), { duration: 0.8 })
    }
  }, [targetCenter, map])

  return null
}

// Minimal Map Controls Component (+, -, Near Me with clean SVG, zero emojis)
function MapControls({
  onNearMe,
  hasLocationPermission,
}: {
  onNearMe: () => void
  hasLocationPermission: boolean
}) {
  const map = useMap()

  return (
    <div className="map-floating-controls">
      <button
        className="map-control-btn"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        className="map-control-btn"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
      <button
        className={`map-control-btn ${hasLocationPermission ? 'map-nearme-btn' : ''}`}
        onClick={onNearMe}
        aria-label="Center on my location"
        title={hasLocationPermission ? 'Center on my location' : 'Detect my location'}
      >
        <Icon name="location-pin" size={16} color={hasLocationPermission ? '#ffffff' : 'var(--text-secondary)'} />
      </button>
    </div>
  )
}

interface EWasteMapProps {
  height?: string | number
  onSelectItemDetails?: (item: Post) => void
}

export default function EWasteMap({
  height = '650px',
  onSelectItemDetails,
}: EWasteMapProps) {
  // 1. Geolocation State
  const [userCoords, setUserCoords] = useState<[number, number]>(DEFAULT_COORDS)
  const [mapTargetCenter, setMapTargetCenter] = useState<[number, number] | null>(null)
  const [accuracyRadius, setAccuracyRadius] = useState<number | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState<number>(13)
  const [locationDetected, setLocationDetected] = useState<boolean>(false)

  // 2. Database Centers State (Supabase public.recycling_centers)
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([])
  const [isLoadingCenters, setIsLoadingCenters] = useState<boolean>(true)
  const [centersError, setCentersError] = useState<string | null>(null)

  // 3. Optional Community Posts
  const [posts, setPosts] = useState<Post[]>([])

  // 4. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<MapCategoryFilter>('all')
  const [activeRadius, setActiveRadius] = useState<number>(35) // Default covers Coimbatore region (35km)

  // 5. Selected Marker Entity (Displayed when marker is clicked/tapped)
  const [selectedEntity, setSelectedEntity] = useState<SelectedMapEntity | null>(null)

  // Geolocation detection
  const detectUserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude, accuracy } = pos.coords
          if (isValidCoordinate(latitude, longitude)) {
            const coords: [number, number] = [latitude, longitude]
            setUserCoords(coords)
            setMapTargetCenter(coords)
            setAccuracyRadius(accuracy)
            setLocationDetected(true)
          }
        },
        () => {
          // Denied or unavailable: do NOT break map, fallback to Coimbatore central
          setUserCoords(DEFAULT_COORDS)
          setLocationDetected(false)
          setAccuracyRadius(undefined)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    }
  }, [])

  useEffect(() => {
    detectUserLocation()
  }, [detectUserLocation])

  // Load Official Recycling Centers from Supabase (Source of Truth)
  const loadRecyclingCenters = useCallback(async () => {
    setIsLoadingCenters(true)
    setCentersError(null)

    try {
      const coords = locationDetected ? userCoords : null
      const data = await recyclingCentersApi.getRecyclingCenters(coords)
      setRecyclingCenters(data)
    } catch (err: any) {
      console.error('Failed to load recycling centers from Supabase:', err)
      setCentersError(err.message || 'Unable to load recycling centers.')
    } finally {
      setIsLoadingCenters(false)
    }
  }, [locationDetected, userCoords])

  // Load Community Posts
  const loadCommunityPosts = useCallback(async () => {
    try {
      const p = await postsApi.getPosts()
      const available = p.filter(item => !item.status || item.status === 'available')
      setPosts(available)
    } catch {
      setPosts([])
    }
  }, [])

  useEffect(() => {
    loadRecyclingCenters()
    loadCommunityPosts()
  }, [loadRecyclingCenters, loadCommunityPosts])

  // =========================================================================
  // FILTERING, SEARCH & SORTING PIPELINE
  // =========================================================================

  const filteredCenters = useMemo(() => {
    if (activeCategory === 'items') return []

    // 1. Text Search across Name, Area, Address, City
    let list = recyclingCentersApi.filterCentersByQuery(recyclingCenters, searchQuery)

    // 2. City Filter (Coimbatore)
    if (activeCategory === 'coimbatore') {
      list = list.filter(c => c.city.toLowerCase().includes('coimbatore'))
    }

    // 3. Distance Radius Filter (only applied if user location is known)
    if (locationDetected) {
      list = list.filter(c => typeof c.distanceKm === 'number' && c.distanceKm <= activeRadius)
    }

    // 4. Nearest Sorting (if Nearest selected or location is detected)
    if (activeCategory === 'nearest' && locationDetected) {
      list = [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }

    return list
  }, [recyclingCenters, searchQuery, activeCategory, activeRadius, locationDetected])

  const filteredPosts = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'items') return []

    return posts.filter(post => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        post.title.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.brand.toLowerCase().includes(q)
      )
    })
  }, [posts, searchQuery, activeCategory])

  // =========================================================================
  // MARKER CLUSTERING (Clean Grid Cluster when zoomed out)
  // =========================================================================

  const allMapPoints = useMemo(() => {
    const centerPoints = filteredCenters.map(c => ({
      ...c,
      entityType: 'center' as const,
      lat: c.latitude,
      lng: c.longitude,
    }))

    const postPoints = filteredPosts.map((p, idx) => {
      const latOffsets = [0.008, -0.011, 0.014, -0.006, 0.019, -0.015, 0.003]
      const lngOffsets = [-0.007, 0.012, -0.014, 0.016, 0.004, -0.009, 0.018]
      const lat = p.latitude ?? (DEFAULT_COORDS[0] + (latOffsets[idx % latOffsets.length] || 0.005))
      const lng = p.longitude ?? (DEFAULT_COORDS[1] + (lngOffsets[idx % lngOffsets.length] || -0.005))

      return {
        ...p,
        entityType: 'item' as const,
        lat,
        lng,
      }
    })

    return [...centerPoints, ...postPoints]
  }, [filteredCenters, filteredPosts])

  const { clusters, singles } = useMemo(() => {
    return clusterPoints(allMapPoints, currentZoom)
  }, [allMapPoints, currentZoom])

  // Custom Icon Caches (100% SVG, Zero Emojis)
  const userPinIcon = useMemo(() => createUserLocationIcon(), [])
  const recyclingCenterPinIcon = useMemo(() => createRecyclingCenterIcon(false), [])
  const selectedCenterPinIcon = useMemo(() => createRecyclingCenterIcon(true), [])

  return (
    <div className="smart-map-container" style={{ height }}>
      {/* 1. CONTROLLED MAP OVERLAY (Search -> Filters -> Status) */}
      <div className="map-overlay">
        {/* Row 1: Search Bar */}
        <MapSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Row 2: Filter Row */}
        <MapFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeRadius={activeRadius}
          onRadiusChange={setActiveRadius}
          hasLocationPermission={locationDetected}
        />

        {/* Row 3: Status / Loading / Count Banner */}
        <div className="map-location-status">
          {isLoadingCenters ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="refresh" size={12} color="var(--accent)" />
              Loading recycling centers...
            </span>
          ) : centersError ? (
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
              Unable to load recycling centers.
              <button
                onClick={loadRecyclingCenters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '0.72rem',
                }}
              >
                Try Again
              </button>
            </span>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="location-pin" size={12} color={locationDetected ? 'var(--accent)' : 'var(--text-tertiary)'} />
                {locationDetected ? 'Location active' : 'Coimbatore District'}
              </span>
              <span style={{ opacity: 0.5 }}>•</span>
              <strong style={{ color: 'var(--accent)' }}>
                {filteredCenters.length} Recycling Centers
              </strong>
            </>
          )}
        </div>
      </div>

      {/* 2. LEAFLET MAP CANVAS */}
      <MapContainer
        center={DEFAULT_COORDS}
        zoom={12}
        scrollWheelZoom={true}
        className="smart-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Location Marker */}
        {locationDetected && (
          <Marker position={userCoords} icon={userPinIcon}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#10b981' }}>Your Location</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Subtle Accuracy Ring */}
        {locationDetected && accuracyRadius && (
          <Circle
            center={userCoords}
            radius={Math.min(accuracyRadius, 800)}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        )}

        {/* Radius Boundary Ring when user location is active */}
        {locationDetected && (
          <Circle
            center={userCoords}
            radius={activeRadius * 1000}
            pathOptions={{
              color: '#059669',
              fillColor: '#059669',
              fillOpacity: 0.03,
              dashArray: '4, 8',
              weight: 1.2,
            }}
          />
        )}

        {/* Clustered Markers (when zoomed out) */}
        {clusters.map(cluster => (
          <Marker
            key={cluster.id}
            position={[cluster.lat, cluster.lng]}
            icon={createClusterIcon(cluster.items.length)}
            eventHandlers={{
              click: () => {
                setMapTargetCenter([cluster.lat, cluster.lng])
              },
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <strong>{cluster.items.length} Recycling Centers</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Click to zoom in</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Individual Markers for Official Recycling Centers */}
        {singles.map(point => {
          const isCenter = point.entityType === 'center'
          const center = isCenter ? (point as any as RecyclingCenter) : null
          const item = !isCenter ? (point as any as Post) : null
          const isSelected = selectedEntity?.type === 'center' && selectedEntity.data.id === point.id

          return (
            <Marker
              key={`${point.entityType}-${point.id}`}
              position={[point.lat, point.lng]}
              icon={isCenter ? (isSelected ? selectedCenterPinIcon : recyclingCenterPinIcon) : recyclingCenterPinIcon}
              eventHandlers={{
                click: () => {
                  if (isCenter && center) {
                    setSelectedEntity({
                      type: 'center',
                      data: center,
                      distanceKm: center.distanceKm,
                    })
                  } else if (!isCenter && item) {
                    setSelectedEntity({
                      type: 'item',
                      data: item,
                    })
                  }
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: 160, padding: 2 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {isCenter ? center?.name : item?.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {isCenter ? center?.address : item?.condition}
                  </div>
                  {isCenter && center?.contact_phone && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="phone-call" size={12} color="var(--accent)" />
                      <span>{center.contact_phone}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Map Controller & Events */}
        <MapEventHandler onZoomChange={setCurrentZoom} targetCenter={mapTargetCenter} />

        {/* Floating Controls */}
        <MapControls
          onNearMe={() => {
            detectUserLocation()
            if (locationDetected) {
              setMapTargetCenter(userCoords)
            }
          }}
          hasLocationPermission={locationDetected}
        />
      </MapContainer>

      {/* 3. EMPTY STATE OVERLAY (When database returns 0 centers) */}
      {!isLoadingCenters && !centersError && filteredCenters.length === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 20px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No recycling centers available.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Try again later or adjust search filters.
          </div>
        </div>
      )}

      {/* 4. RECYCLING CENTER INFORMATION CARD (Shown upon marker click) */}
      {selectedEntity && (
        <ItemPreviewCard
          selected={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onViewDetails={item => onSelectItemDetails?.(item)}
        />
      )}
    </div>
  )
}
