import Icon from '../Icon'

export type LocationStatus = 'detecting' | 'found' | 'denied' | 'unavailable'

interface UserLocationProps {
  status: LocationStatus
  accuracy?: number
  onRetry: () => void
}

export default function UserLocation({
  status,
  accuracy,
  onRetry,
}: UserLocationProps) {
  if (status === 'detecting') {
    return (
      <div className="gl-location-status-badge">
        <Icon name="refresh" size={13} color="var(--accent)" />
        <span>Detecting your location...</span>
      </div>
    )
  }

  if (status === 'found') {
    return (
      <div className="gl-location-status-badge">
        <span style={{ color: '#2563eb' }}>📍</span>
        <span>Your location detected {accuracy ? `(±${Math.round(accuracy)}m)` : ''}</span>
      </div>
    )
  }

  if (status === 'denied' || status === 'unavailable') {
    return (
      <div
        className="gl-location-status-badge"
        style={{
          border: '1px solid rgba(239, 68, 68, 0.4)',
          background: 'rgba(254, 242, 242, 0.9)',
          color: '#b91c1c',
        }}
      >
        <Icon name="alert" size={13} color="#ef4444" />
        <span>Location disabled. Using default city center.</span>
        <button
          onClick={onRetry}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 8px',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          Enable
        </button>
      </div>
    )
  }

  return null
}
