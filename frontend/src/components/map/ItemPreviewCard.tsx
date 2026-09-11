import type { Post } from '../../types/post.types'
import type { EcosystemPartner } from '../../types/map.types'
import type { RecyclingCenter } from '../../types/recyclingCenter.types'
import Icon from '../Icon'
import { Badge } from '../ui'
import { formatCurrency } from '../../utils/formatting'
import { formatDistance } from '../../utils/distance'
import { recyclingCentersApi } from '../../services/recycling/recyclingCenters.api'

export type SelectedMapEntity =
  | { type: 'center'; data: RecyclingCenter; distanceKm?: number }
  | { type: 'item'; data: Post; distanceKm?: number }
  | { type: 'partner'; data: EcosystemPartner; distanceKm?: number }

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
  // 1. RECYCLING CENTER CARD (Direct Database-Driven from public.recycling_centers)
  if (selected.type === 'center') {
    const center = selected.data as RecyclingCenter
    const hasDistance = typeof selected.distanceKm === 'number' && !isNaN(selected.distanceKm)
    const directionsUrl = recyclingCentersApi.getDirectionsUrl(center.latitude, center.longitude)
    const telUrl = recyclingCentersApi.getTelUrl(center.contact_phone)

    return (
      <div
        className="map-item-card"
        role="dialog"
        aria-label={`Details for ${center.name}`}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '16px 18px',
          animation: 'slide-up 0.25s var(--transition-spring)',
          maxWidth: 420,
          width: 'calc(100% - 32px)',
        }}
      >
        {/* Top Header & Dismiss */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Badge variant="green" size="sm">
                Recycling Center
              </Badge>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {center.city}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                margin: '2px 0 6px',
                color: 'var(--text-primary)',
                lineHeight: 1.3,
              }}
            >
              {center.name}
            </h3>

            {/* Address */}
            <p
              style={{
                fontSize: '0.80rem',
                color: 'var(--text-secondary)',
                margin: '0 0 6px',
                lineHeight: 1.4,
              }}
            >
              {center.address}
            </p>

            {/* City & Phone & Distance */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px 12px',
                fontSize: '0.78rem',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)' }}>
                <Icon name="phone" size={13} color="var(--accent)" />
                {center.contact_phone}
              </span>

              {hasDistance && (
                <span
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon name="map" size={13} color="var(--accent)" />
                  {formatDistance(selected.distanceKm!)} away
                </span>
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
            aria-label="Close details card"
          >
            <Icon name="close" size={14} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Action Buttons: [Get Directions] & [Call] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              fontSize: '0.80rem',
              fontWeight: 700,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Icon name="map" size={14} color="#ffffff" />
            Get Directions
          </a>

          <a
            href={telUrl}
            className="btn btn-outline btn-sm"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              fontSize: '0.80rem',
              fontWeight: 700,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <Icon name="phone" size={14} color="var(--accent)" />
            Call
          </a>
        </div>
      </div>
    )
  }

  // 2. COMMUNITY E-WASTE POST PREVIEW CARD
  const isItem = selected.type === 'item'
  const itemData = isItem ? (selected.data as Post) : null
  const partnerData = !isItem ? (selected.data as EcosystemPartner) : null
  const hasDistance = typeof selected.distanceKm === 'number' && !isNaN(selected.distanceKm)

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
              <Badge variant="blue" size="sm">
                Certified Hub
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
                <span>{itemData?.condition}</span>
                {hasDistance && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      {formatDistance(selected.distanceKm!)} away
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {partnerData?.address}
                </span>
                {hasDistance && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
                      {formatDistance(selected.distanceKm!)} away
                    </span>
                  </>
                )}
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

      {/* Bottom Price/Action Button */}
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
          {isItem && (
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
              {itemData?.price ? formatCurrency(itemData.price) : 'Free Drop-Off'}
            </div>
          )}
        </div>

        <div>
          {isItem && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => itemData && onViewDetails?.(itemData)}
            >
              View Details →
            </button>
          )}

          {!isItem && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => partnerData && onSchedulePickup?.(partnerData)}
            >
              Schedule Pickup →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
