import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import MapHeader from './components/MapHeader/MapHeader'
import RecyclingCenterCard from './components/RecyclingCenterCard'
import BulkDriveModal from './components/Modals/BulkDriveModal'
import PostDetailModal from '../../components/PostDetailModal'
import EWasteMap from '../../components/map/EWasteMap'
import Icon from '../../components/Icon'
import { EmptyState } from '../../components/ui'
import type { RecyclingCenter } from '../../types/recyclingCenter.types'
import type { Post } from '../../types/post.types'
import { recyclingCentersApi, isValidCoordinate } from '../../services/recycling/recyclingCenters.api'
import { DEFAULT_COORDS } from '../../utils/mapHelpers'

export default function MapPage() {
  const { updateCoins } = useAuth()

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearest' | 'coimbatore'>('all')

  // Geolocation state
  const [userCoords, setUserCoords] = useState<[number, number]>(DEFAULT_COORDS)
  const [locationDetected, setLocationDetected] = useState(false)

  // Supabase Database Centers State
  const [centers, setCenters] = useState<RecyclingCenter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Detect user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          if (isValidCoordinate(latitude, longitude)) {
            setUserCoords([latitude, longitude])
            setLocationDetected(true)
          }
        },
        () => {
          setLocationDetected(false)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    }
  }, [])

  // Load from Supabase public.recycling_centers
  const loadCenters = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const coords = locationDetected ? userCoords : null
      const data = await recyclingCentersApi.getRecyclingCenters(coords)
      setCenters(data)
      if (data.length > 0 && !selectedCenter) {
        setSelectedCenter(data[0])
      }
    } catch (err: any) {
      console.error('Failed to load recycling centers:', err)
      setError(err.message || 'Unable to load recycling centers.')
    } finally {
      setIsLoading(false)
    }
  }, [locationDetected, userCoords, selectedCenter])

  useEffect(() => {
    loadCenters()
  }, [loadCenters])

  // Filter and Search Pipeline
  const filteredCenters = useMemo(() => {
    let list = recyclingCentersApi.filterCentersByQuery(centers, searchQuery)

    if (selectedFilter === 'coimbatore') {
      list = list.filter(c => c.city.toLowerCase().includes('coimbatore'))
    }

    if (selectedFilter === 'nearest' && locationDetected) {
      list = [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }

    return list
  }, [centers, searchQuery, selectedFilter, locationDetected])

  // Fixed Full-Screen Viewport for Map Mode (Zero Page Scroll)
  if (viewMode === 'map') {
    return (
      <div
        className="map-page"
        style={{
          width: '100%',
        }}
      >
        {/* Fixed Top Header */}
        <MapHeader
          onOpenBulkModal={() => setShowBulkModal(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Full Unobstructed Fixed Map Container */}
        <div
          className="map-content"
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <EWasteMap
            height="100%"
            onSelectItemDetails={item => setSelectedPost(item)}
          />
        </div>

        {/* Bulk Drive Modal */}
        <BulkDriveModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onDriveSuccess={() => updateCoins(100)}
        />

        {selectedPost && (
          <PostDetailModal
            post={selectedPost as any}
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    )
  }

  // Standard Scrollable Directory View (List Mode)
  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>
      {/* Header */}
      <MapHeader
        onOpenBulkModal={() => setShowBulkModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="container" style={{ paddingTop: 14 }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 14px',
            }}
          >
            <Icon name="search" size={16} color="var(--accent)" />
            <input
              className="input-search"
              placeholder="Search center by name, area, or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.84rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Icon name="close" size={14} color="var(--text-tertiary)" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips: All Centers, Nearest, Coimbatore (Zero emojis) */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 6, marginBottom: 14 }}>
          {[
            { id: 'all', label: 'All Centers', icon: 'map' as const },
            { id: 'nearest', label: 'Nearest', icon: 'location-pin' as const, requiresLocation: true },
            { id: 'coimbatore', label: 'Coimbatore', icon: 'building' as const },
          ].map(f => {
            const isSelected = selectedFilter === f.id
            const isDisabled = f.requiresLocation && !locationDetected

            return (
              <button
                key={f.id}
                onClick={() => {
                  if (isDisabled) return
                  setSelectedFilter(f.id as any)
                }}
                disabled={isDisabled}
                style={{
                  background: isSelected ? 'var(--accent)' : 'var(--bg-surface)',
                  color: isSelected ? '#fff' : isDisabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: isDisabled ? 0.5 : 1,
                }}
                title={isDisabled ? 'Allow location permission to sort by nearest' : undefined}
              >
                <Icon name={f.icon} size={13} color={isSelected ? '#fff' : 'var(--text-secondary)'} />
                <span>{f.label}</span>
              </button>
            )
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
              <Icon name="refresh" size={16} color="var(--accent)" />
              Loading recycling centers...
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div style={{ padding: '30px 16px', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontWeight: 700, marginBottom: 12 }}>Unable to load recycling centers.</p>
            <button
              onClick={loadCenters}
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 16px', fontWeight: 700 }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCenters.length === 0 && (
          <div style={{ marginTop: 20 }}>
            <EmptyState
              icon="search"
              title="No recycling centers available."
              description="Try again later or adjust your search keywords."
              actionLabel={searchQuery ? 'Clear Search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
            />
          </div>
        )}

        {/* Recycling Centers Grid */}
        {!isLoading && !error && filteredCenters.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {filteredCenters.map(center => (
              <RecyclingCenterCard
                key={center.id}
                center={center}
                isSelected={selectedCenter?.id === center.id}
                onSelect={() => setSelectedCenter(center)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bulk Drive Modal */}
      <BulkDriveModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onDriveSuccess={() => updateCoins(100)}
      />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost as any}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  )
}
