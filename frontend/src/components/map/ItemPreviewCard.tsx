import type { Post } from '../../types/post.types'
import type { EcosystemPartner } from '../../types/map.types'
import Icon from '../Icon'
import { Badge, Button } from '../ui'
import { formatCurrency } from '../../utils/formatting'
import { formatDistance } from '../../utils/distance'

export type SelectedMapEntity =
  | { type: 'item'; data: Post; distanceKm: number }
  | { type: 'partner'; data: EcosystemPartner; distanceKm: number }

interface ItemPreviewCardProps {
  selected: SelectedMapEntity
  onClose: () => void
  onViewDetails?: (item: Post) => void
  onSchedulePickup?: (partner: EcosystemPartner) => void
}

export default function ItemPreviewCard({
  selected,
  onClose,
  onViewDetails,
  onSchedulePickup,
}: ItemPreviewCardProps) {
  const isItem = selected.type === 'item'
  const itemData = isItem ? (selected.data as Post) : null
  const partnerData = !isItem ? (selected.data as EcosystemPartner) : null

  return (
    <div
      className="map-item-card"
      role="dialog"
      aria-label="Item details"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '16px 18px',
        animation: 'slide-up 0.25s var(--transition-spring)',
      }}
    >
      {/* Top Details & Dismiss */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {isItem ? (
              <Badge variant="green" size="sm">
                Community E-Waste
              </Badge>
            ) : (
              <Badge variant={partnerData?.type === 'recycler' ? 'green' : 'blue'} size="sm">
                {partnerData?.type === 'recycler' ? 'Authorized Recycler' : 'Certified Repair Hub'}
              </Badge>
            )}

            {!isItem && partnerData?.verified && (
              <Badge variant="amber" size="sm">
                TNPCB Verified
              </Badge>
            )}
          </div>

          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              margin: '0 0 4px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isItem ? itemData?.title : partnerData?.name}
          </h4>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {isItem ? (
              <>
                <span>{itemData?.condition}</span> •{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  📍 {formatDistance(selected.distanceKm)} away
                </span>
              </>
            ) : (
              <>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {partnerData?.address}
                </span>{' '}
                •{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
                  📍 {formatDistance(selected.distanceKm)} away
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-surface-2)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
          aria-label="Close preview"
        >
          <Icon name="close" size={14} color="var(--text-tertiary)" />
        </button>
      </div>

      {/* Bottom Price/Rating & Action Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          {isItem ? (
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
              {itemData?.price ? formatCurrency(itemData.price) : 'Free Drop-Off'}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>⭐ {partnerData?.rating || 4.8}</span>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>({partnerData?.reviews || 38} reviews)</span>
            </div>
          )}
        </div>

        <div>
          {isItem && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => itemData && onViewDetails?.(itemData)}
            >
              View Listing Details →
            </Button>
          )}

          {!isItem && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => partnerData && onSchedulePickup?.(partnerData)}
            >
              Schedule Pickup →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
