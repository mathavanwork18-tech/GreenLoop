import { useNavigate } from 'react-router-dom'
import type { EcosystemPartner } from '../../../../types/map.types'
import Icon from '../../../../components/Icon'

interface NearbySectionProps {
  partners: EcosystemPartner[]
}

export default function NearbySection({ partners }: NearbySectionProps) {
  const navigate = useNavigate()

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 20 }}>
      <div className="section-header">
        <span className="section-title">Nearby Verified Eco-Hubs</span>
        <span className="section-link" onClick={() => navigate('/map')}>
          View on Map
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {partners.map(p => (
          <div
            key={p.id}
            onClick={() => navigate('/map')}
            className="card"
            style={{
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: p.type === 'recycler' ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon name={p.icon} size={22} color={p.type === 'recycler' ? 'var(--accent)' : '#2563eb'} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {p.address} • <strong>{p.distance} km</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
