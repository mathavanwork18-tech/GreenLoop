import type { EcosystemPartner } from '../../../../types/map.types'
import Icon from '../../../../components/Icon'

interface PartnerCardProps {
  partner: EcosystemPartner
  isSelected: boolean
  onSelect: () => void
  onSchedulePickup: (e: React.MouseEvent) => void
}

export default function PartnerCard({
  partner,
  isSelected,
  onSelect,
  onSchedulePickup
}: PartnerCardProps) {
  const isRecycler = partner.type === 'recycler'

  return (
    <div
      onClick={onSelect}
      className="card"
      style={{
        padding: 14,
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
        background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: isRecycler ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name={partner.icon} size={18} color={isRecycler ? 'var(--accent)' : '#2563eb'} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {partner.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {partner.address} • <strong>{partner.distance} km</strong>
            </div>
          </div>
        </div>

        <span
          style={{
            background: partner.open ? '#d1fae5' : '#fee2e2',
            color: partner.open ? '#059669' : '#dc2626',
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {partner.open ? 'Open Now' : 'Closed'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
        {partner.services.map(s => (
          <span
            key={s}
            style={{
              background: 'var(--bg-surface-2)',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              color: 'var(--text-secondary)'
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
          <Icon name="star" size={13} color="#f59e0b" />
          <span>{partner.rating} ({partner.reviews})</span>
        </div>

        {isRecycler && (
          <button
            onClick={onSchedulePickup}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            Schedule Pickup
          </button>
        )}
      </div>
    </div>
  )
}
