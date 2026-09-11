import type { RecyclingCenter } from '../../../types/recyclingCenter.types'
import Icon from '../../../components/Icon'
import { Badge } from '../../../components/ui'
import { formatDistance } from '../../../utils/distance'
import { recyclingCentersApi } from '../../../services/recycling/recyclingCenters.api'

interface RecyclingCenterCardProps {
  center: RecyclingCenter
  isSelected?: boolean
  onSelect?: () => void
}

export default function RecyclingCenterCard({
  center,
  isSelected = false,
  onSelect,
}: RecyclingCenterCardProps) {
  const directionsUrl = recyclingCentersApi.getDirectionsUrl(center.latitude, center.longitude)
  const telUrl = recyclingCentersApi.getTelUrl(center.contact_phone)
  const hasDistance = typeof center.distanceKm === 'number' && !isNaN(center.distanceKm)

  return (
    <div
      onClick={onSelect}
      className="card"
      style={{
        padding: 16,
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
        background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Badge variant="green" size="sm">
            Recycling Center
          </Badge>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {center.city}
          </span>
        </div>

        <h3
          style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--text-primary)',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}
        >
          {center.name}
        </h3>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            margin: '0 0 8px',
            lineHeight: 1.4,
          }}
        >
          {center.address}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.76rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)', fontWeight: 600 }}>
            <Icon name="phone" size={13} color="var(--accent)" />
            {center.contact_phone}
          </span>

          {hasDistance && (
            <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="map" size={13} color="var(--accent)" />
              {formatDistance(center.distanceKm!)} away
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: [Get Directions] & [Call] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 10,
          marginTop: 4,
        }}
        onClick={e => e.stopPropagation()}
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
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Icon name="map" size={13} color="#ffffff" />
          Directions
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
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <Icon name="phone" size={13} color="var(--accent)" />
          Call
        </a>
      </div>
    </div>
  )
}
