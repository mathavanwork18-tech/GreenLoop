import { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './EWasteMap.css'

import { postsApi } from '../../services/posts/posts.api'
import { mapsApi } from '../../services/maps/maps.api'
import type { Post } from '../../types/post.types'
import type { EcosystemPartner } from '../../types/map.types'

import { calculateDistance } from '../../utils/distance'
import {
  createMapIcon,
  createClusterIcon,
  createUserLocationIcon,
  clusterPoints,
  DEFAULT_COORDS,
  isValidCoordinate,
} from '../../utils/mapHelpers'

import MapSearch from './MapSearch'
import MapFilters, { type MapCategoryFilter } from './MapFilters'
import ItemPreviewCard, { type SelectedMapEntity } from './ItemPreviewCard'

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
    if (targetCenter) {
      map.flyTo(targetCenter, Math.max(map.getZoom(), 14), { duration: 0.8 })
    }
  }, [targetCenter, map])

  return null
}

// Minimal Map Controls Component (+, -, Near Me)
function MapControls({
  onNearMe,
}: {
  onNearMe: () => void
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
        className="map-control-btn map-nearme-btn"
        onClick={onNearMe}
        aria-label="Near Me"
        title="Center on my location"
      >
        📍
      </button>
    </div>
  )
}

interface EWasteMapProps {
  height?: string | number
  onSelectItemDetails?: (item: Post) => void
  onSchedulePickup?: (partner: EcosystemPartner) => void
}

export default function EWasteMap({
  height = '650px',
  onSelectItemDetails,
  onSchedulePickup,
}: EWasteMapProps) {
  // 1. Geolocation State
  const [userCoords, setUserCoords] = useState<[number, number]>(DEFAULT_COORDS)
  const [mapTargetCenter, setMapTargetCenter] = useState<[number, number] | null>(null)
  const [accuracyRadius, setAccuracyRadius] = useState<number | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState<number>(13)
  const [locationDetected, setLocationDetected] = useState<boolean>(false)

  // 2. Data State
  const [posts, setPosts] = useState<Post[]>([])
  const [partners, setPartners] = useState<EcosystemPartner[]>([])

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<MapCategoryFilter>('all')
  const [activeRadius, setActiveRadius] = useState<number>(10) // 10 km default

  // 4. Selected Marker Entity (Only shown when marker is clicked)
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
          setUserCoords(DEFAULT_COORDS)
          setLocationDetected(false)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    }
  }, [])

  useEffect(() => {
    detectUserLocation()
  }, [detectUserLocation])

  // Data fetching & database sync
  const loadData = useCallback(() => {
    Promise.all([postsApi.getPosts(), mapsApi.getPartners()]).then(([p, part]) => {
      const availablePosts = p.filter(item => !item.status || item.status === 'available')
      setPosts(availablePosts)
      setPartners(part)
    })
  }, [])

  useEffect(() => {
    loadData()
    const handleSync = () => loadData()
    window.addEventListener('gl_posts_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('gl_posts_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [loadData])

  // =========================================================================
  // HAVERSINE DISTANCE COMPUTATION & FILTER PIPELINE
  // =========================================================================

  const computedItems = useMemo(() => {
    return posts.map((post, idx) => {
      const latOffsets = [0.008, -0.011, 0.014, -0.006, 0.019, -0.015, 0.003]
      const lngOffsets = [-0.007, 0.012, -0.014, 0.016, 0.004, -0.009, 0.018]
      const lat = post.latitude ?? (DEFAULT_COORDS[0] + (latOffsets[idx % latOffsets.length] || 0.005))
      const lng = post.longitude ?? (DEFAULT_COORDS[1] + (lngOffsets[idx % lngOffsets.length] || -0.005))
      const distanceKm = calculateDistance(userCoords[0], userCoords[1], lat, lng)
      const isParts =
        post.condition.toLowerCase().includes('broken') ||
        post.condition.toLowerCase().includes('parts') ||
        post.category.toLowerCase().includes('parts') ||
        post.purpose.toLowerCase() === 'recycle'

      return {
        ...post,
        latitude: lat,
        longitude: lng,
        distanceKm,
        isParts,
      }
    })
  }, [posts, userCoords])

  const computedPartners = useMemo(() => {
    return partners.map(partner => {
      const distanceKm = calculateDistance(userCoords[0], userCoords[1], partner.lat, partner.lng)
      return {
        ...partner,
        distanceKm,
      }
    })
  }, [partners, userCoords])

  // Filtered Lists
  const filteredItems = useMemo(() => {
    return computedItems
      .filter(item => {
        if (item.distanceKm > activeRadius) return false
        if (activeCategory === 'centers' || activeCategory === 'shops') return false
        if (activeCategory === 'parts' && !item.isParts) return false
        if (activeCategory === 'items' && item.isParts) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = item.title.toLowerCase().includes(q)
          const matchCat = item.category.toLowerCase().includes(q)
          const matchBrand = item.brand.toLowerCase().includes(q)
          const matchDesc = item.description.toLowerCase().includes(q)
          const matchLoc = (item.locationName || item.location).toLowerCase().includes(q)
          const matchSeller = item.seller.name.toLowerCase().includes(q)
          if (!matchTitle && !matchCat && !matchBrand && !matchDesc && !matchLoc && !matchSeller) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [computedItems, activeRadius, activeCategory, searchQuery])

  const filteredPartners = useMemo(() => {
    return computedPartners
      .filter(partner => {
        if (partner.distanceKm > activeRadius) return false
        if (activeCategory === 'items' || activeCategory === 'parts') return false
        if (activeCategory === 'centers' && partner.type !== 'recycler') return false
        if (activeCategory === 'shops' && partner.type !== 'shop' && partner.type !== 'repair') return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = partner.name.toLowerCase().includes(q)
          const matchServices = partner.services.some(s => s.toLowerCase().includes(q))
          const matchAddr = partner.address.toLowerCase().includes(q)
          if (!matchName && !matchServices && !matchAddr) return false
        }
        return true
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [computedPartners, activeRadius, activeCategory, searchQuery])

  const totalResultsCount = filteredItems.length + filteredPartners.length

  // =========================================================================
  // MARKER CLUSTERING (Clean Grid Cluster when zoomed out)
  // =========================================================================

  const allMapPoints = useMemo(() => {
    const itemPoints = filteredItems.map(i => ({ ...i, entityType: 'item' as const, lat: i.latitude!, lng: i.longitude! }))
    const partnerPoints = filteredPartners.map(p => ({ ...p, entityType: 'partner' as const, lat: p.lat, lng: p.lng }))
    return [...itemPoints, ...partnerPoints]
  }, [filteredItems, filteredPartners])

  const { clusters, singles } = useMemo(() => {
    return clusterPoints(allMapPoints, currentZoom)
  }, [allMapPoints, currentZoom])

  // Custom DivIcon caches
  const userPinIcon = useMemo(() => createUserLocationIcon(), [])
  const itemPinIcon = useMemo(() => createMapIcon('📦', 'pin-item'), [])
  const partsPinIcon = useMemo(() => createMapIcon('🔧', 'pin-parts'), [])
  const shopPinIcon = useMemo(() => createMapIcon('🏪', 'pin-shop'), [])
  const recyclerPinIcon = useMemo(() => createMapIcon('♻️', 'pin-recycler'), [])

  return (
    <div className="smart-map-container" style={{ height }}>
      {/* 1. CONTROLLED MAP OVERLAY (Vertical flow: Search -> Filters -> Location) */}
      <div className="map-overlay">
        {/* Row 1: Search Bar */}
        <MapSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Row 2: Filter Row (Horizontal Scrolling without wrapping) */}
        <MapFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeRadius={activeRadius}
          onRadiusChange={setActiveRadius}
        />

        {/* Row 3: Compact Location Status (Fit Content) */}
        <div className="map-location-status">
          <span>{locationDetected ? '📍 Location detected' : '📍 Coimbatore Center'}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <strong style={{ color: 'var(--accent)' }}>{totalResultsCount} nearby ({activeRadius} km)</strong>
        </div>
      </div>

      {/* 2. LEAFLET MAP CANVAS (Background) */}
      <MapContainer
        center={userCoords}
        zoom={13}
        scrollWheelZoom={true}
        className="smart-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker & Accuracy Ring */}
        <Marker position={userCoords} icon={userPinIcon}>
          <Popup>
            <div style={{ textAlign: 'center', padding: '2px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#2563eb' }}>📍 You Are Here</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Subtle Accuracy Ring */}
        {accuracyRadius && (
          <Circle
            center={userCoords}
            radius={Math.min(accuracyRadius, 600)}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        )}

        {/* Radius Boundary Ring */}
        <Circle
          center={userCoords}
          radius={activeRadius * 1000}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.03,
            dashArray: '5, 8',
            weight: 1.2,
          }}
        />

        {/* Render Clusters when zoomed out */}
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
                <strong>{cluster.items.length} E-Waste Locations</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Click to zoom in</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Individual Pins (Singles or All when zoomed in) */}
        {singles.map(point => {
          const isItem = point.entityType === 'item'
          const item = isItem ? (point as any as Post & { distanceKm: number; isParts: boolean }) : null
          const partner = !isItem ? (point as any as EcosystemPartner & { distanceKm: number }) : null

          const icon = isItem
            ? item?.isParts
              ? partsPinIcon
              : itemPinIcon
            : partner?.type === 'recycler'
            ? recyclerPinIcon
            : shopPinIcon

          return (
            <Marker
              key={`${point.entityType}-${point.id}`}
              position={[point.lat, point.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (isItem && item) {
                    setSelectedEntity({
                      type: 'item',
                      data: item,
                      distanceKm: item.distanceKm,
                    })
                  } else if (!isItem && partner) {
                    setSelectedEntity({
                      type: 'partner',
                      data: partner,
                      distanceKm: partner.distanceKm,
                    })
                  }
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: 150, padding: 2 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {isItem ? item?.title : partner?.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {isItem ? item?.condition : partner?.address} • {point.distanceKm.toFixed(1)} km away
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Map Controller & Events */}
        <MapEventHandler onZoomChange={setCurrentZoom} targetCenter={mapTargetCenter} />

        {/* Minimal Floating Map Controls (Right Side) */}
        <MapControls
          onNearMe={() => {
            detectUserLocation()
            setMapTargetCenter(userCoords)
          }}
        />
      </MapContainer>

      {/* 3. COMPACT SELECTED ITEM BOTTOM CARD (Only shown when marker is clicked) */}
      {selectedEntity && (
        <ItemPreviewCard
          selected={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onViewDetails={item => onSelectItemDetails?.(item)}
          onSchedulePickup={partner => onSchedulePickup?.(partner)}
        />
      )}
    </div>
  )
}
