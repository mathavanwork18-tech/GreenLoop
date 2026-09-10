import Icon from '../../../../components/Icon'

interface MapHeaderProps {
  onOpenBulkModal: () => void
  viewMode?: 'map' | 'list'
  onViewModeChange?: (mode: 'map' | 'list') => void
}

export default function MapHeader({
  onOpenBulkModal,
  viewMode = 'map',
  onViewModeChange,
}: MapHeaderProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 30,
        flexShrink: 0,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        {/* Left: Title & Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="map" size={16} color="var(--accent)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
              E-Waste Map
            </h1>
            <p
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-tertiary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Coimbatore Region • Verified Ecosystem
            </p>
          </div>
        </div>

        {/* Right: View Mode Toggle & Bulk Drive CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {onViewModeChange && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface-2)',
                padding: 2,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                onClick={() => onViewModeChange('map')}
                style={{
                  background: viewMode === 'map' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon name="map" size={11} color={viewMode === 'map' ? '#fff' : 'var(--text-secondary)'} />
                <span>Map</span>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon name="chart" size={11} color={viewMode === 'list' ? '#fff' : 'var(--text-secondary)'} />
                <span>List</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenBulkModal}
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent-text)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon name="building" size={12} color="var(--accent-text)" />
            <span>Bulk</span>
          </button>
        </div>
      </div>
    </div>
  )
}
