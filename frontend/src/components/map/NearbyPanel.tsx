import { useState, useMemo } from 'react'
import type { Post } from '../../types/post.types'
import type { EcosystemPartner } from '../../types/map.types'
import { formatCurrency } from '../../utils/formatting'
import { formatDistance } from '../../utils/distance'
import Icon from '../Icon'

export type NearbySortOption = 'nearest' | 'newest' | 'price_low'

interface NearbyPanelProps {
  items: (Post & { distanceKm: number })[]
  partners: (EcosystemPartner & { distanceKm: number })[]
  radiusKm: number
  onSelectItem: (item: Post & { distanceKm: number }) => void
  onSelectPartner: (partner: EcosystemPartner & { distanceKm: number }) => void
  onExpandRadius: () => void
}

export default function NearbyPanel({
  items,
  partners,
  radiusKm,
  onSelectItem,
  onSelectPartner,
  onExpandRadius,
}: NearbyPanelProps) {
  const [sortBy, setSortBy] = useState<NearbySortOption>('nearest')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Combined sorted list
  const sortedItems = useMemo(() => {
    const list = [...items]
    if (sortBy === 'nearest') {
      list.sort((a, b) => a.distanceKm - b.distanceKm)
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    }
    return list
  }, [items, sortBy])

  const totalCount = items.length + partners.length

  return (
    <div className="nearby-results-panel">
      {/* Header */}
      <div className="nearby-panel-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Nearby E-Waste & Centers
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                background: 'var(--accent-light)',
                color: 'var(--accent-text)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {totalCount} within {radiusKm} km
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            Sorted by nearest based on your verified GPS coordinates
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            className="nearby-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as NearbySortOption)}
            aria-label="Sort nearby items"
          >
            <option value="nearest">Nearest First</option>
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low → High</option>
          </select>

          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
            }}
            aria-label="Toggle panel collapse"
          >
            <Icon name={isCollapsed ? 'arrow-right' : 'close'} size={14} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          {totalCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                <Icon name="search" size={32} color="var(--text-muted)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                No e-waste found within {radiusKm} km
              </div>
              <p style={{ fontSize: '0.8rem', maxWidth: 360, margin: '0 auto 14px' }}>
                Try expanding your search radius to find electronics and recycling hubs further away.
              </p>
              <button onClick={onExpandRadius} className="btn btn-primary btn-sm">
                <span>Increase Search Radius to {radiusKm < 25 ? '25 km' : '50 km'}</span>
              </button>
            </div>
          ) : (
            <div className="nearby-item-grid">
              {/* Items */}
              {sortedItems.map(item => (
                <div
                  key={`item-card-${item.id}`}
                  className="nearby-mini-card"
                  onClick={() => onSelectItem(item)}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Icon name="package" size={20} color="var(--accent)" />
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {item.category} • <strong style={{ color: 'var(--accent)' }}>{formatDistance(item.distanceKm)}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>
                      {item.price ? formatCurrency(item.price) : 'Free Drop-Off'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Partners */}
              {partners.map(partner => (
                <div
                  key={`partner-card-${partner.id}`}
                  className="nearby-mini-card"
                  onClick={() => onSelectPartner(partner)}
                  style={{ borderLeft: '3px solid var(--accent)' }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: partner.type === 'recycler' ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={partner.type === 'recycler' ? 'recycle' : 'shop'} size={22} color={partner.type === 'recycler' ? '#10b981' : '#2563eb'} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {partner.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {partner.type === 'recycler' ? 'Recycling Center' : 'Repair Shop'} •{' '}
                      <strong style={{ color: 'var(--accent)' }}>{formatDistance(partner.distanceKm)}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      ⭐ {partner.rating} ({partner.reviews}) • {partner.open ? 'Open Now' : 'Closed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
