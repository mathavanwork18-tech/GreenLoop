import Icon from '../Icon'

interface MapSearchProps {
  value: string
  onChange: (query: string) => void
  onClear: () => void
}

export default function MapSearch({
  value,
  onChange,
  onClear,
}: MapSearchProps) {
  return (
    <div className="map-search-bar">
      <Icon name="search" size={17} color="var(--accent)" />
      <input
        type="text"
        className="map-search-input"
        placeholder="Search e-waste, parts, shops..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
          aria-label="Clear search"
        >
          <Icon name="close" size={15} color="var(--text-tertiary)" />
        </button>
      )}
    </div>
  )
}
