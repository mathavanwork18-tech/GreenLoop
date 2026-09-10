import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MOCK_MAP_PARTNERS } from '../../data/mockData'
import MapHeader from './components/MapHeader/MapHeader'
import PartnerCard from './components/PartnerList/PartnerCard'
import PickupScheduleModal from './components/Modals/PickupScheduleModal'
import BulkDriveModal from './components/Modals/BulkDriveModal'
import PostDetailModal from '../../components/PostDetailModal'
import EWasteMap from '../../components/map/EWasteMap'
import Icon from '../../components/Icon'
import { EmptyState } from '../../components/ui'
import type { EcosystemPartner } from '../../types/map.types'
import type { Post } from '../../types/post.types'

export default function MapPage() {
  const { updateCoins } = useAuth()

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [activePartner, setActivePartner] = useState<EcosystemPartner | null>(MOCK_MAP_PARTNERS[1] as unknown as EcosystemPartner)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const filteredPartners = useMemo(() => {
    return (MOCK_MAP_PARTNERS as unknown as EcosystemPartner[]).filter(p => {
      if (selectedFilter === 'shop' && p.type !== 'shop') return false
      if (selectedFilter === 'recycler' && p.type !== 'recycler') return false
      if (selectedFilter === 'repair' && p.type !== 'repair') return false
      if (selectedFilter === 'pickup' && !p.services.includes('Pickup')) return false
      if (selectedFilter === 'open' && !p.open) return false
      if (selectedFilter === 'verified' && !p.verified) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchServices = p.services.some(s => s.toLowerCase().includes(q))
        const matchAddress = p.address.toLowerCase().includes(q)
        if (!matchName && !matchServices && !matchAddress) return false
      }
      return true
    })
  }, [selectedFilter, searchQuery])

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
            onSchedulePickup={partner => {
              setActivePartner(partner)
              setShowPickupModal(true)
            }}
          />
        </div>

        {/* Modals */}
        <PickupScheduleModal
          isOpen={showPickupModal}
          onClose={() => setShowPickupModal(false)}
          partner={activePartner}
          onScheduleSuccess={() => updateCoins(25)}
        />

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

  // Standard Scrollable Directory View
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
              padding: '8px 12px',
            }}
          >
            <Icon name="search" size={16} color="var(--text-tertiary)" />
            <input
              className="input-search"
              placeholder="Search partner by name, area, or service..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 6, marginBottom: 14 }}>
          {[
            { id: 'all', label: 'All Partners' },
            { id: 'recycler', label: 'Recyclers' },
            { id: 'shop', label: 'Repair Shops' },
            { id: 'pickup', label: 'Pickup Available' },
            { id: 'open', label: 'Open Now' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              style={{
                background: selectedFilter === f.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: selectedFilter === f.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Partner Cards Grid */}
        {filteredPartners.length === 0 ? (
          <div style={{ marginTop: 20 }}>
            <EmptyState
              icon="search"
              title="No Eco-Hubs Found"
              description="Try adjusting your filter keywords, or switch to All Partners to view nearby collection points."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedFilter('all')
                setSearchQuery('')
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {filteredPartners.map(partner => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                isSelected={activePartner?.id === partner.id}
                onSelect={() => setActivePartner(partner)}
                onSchedulePickup={e => {
                  e.stopPropagation()
                  setActivePartner(partner)
                  setShowPickupModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PickupScheduleModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        partner={activePartner}
        onScheduleSuccess={() => updateCoins(25)}
      />

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
