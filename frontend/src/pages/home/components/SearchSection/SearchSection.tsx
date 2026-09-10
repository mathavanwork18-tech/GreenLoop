import { useState } from 'react'
import Icon from '../../../../components/Icon'

interface SearchSectionProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  activeFiltersCount: number
}

export default function SearchSection({
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeFiltersCount
}: SearchSectionProps) {
  const [isVoiceListening, setIsVoiceListening] = useState(false)

  const handleVoiceSearch = () => {
    setIsVoiceListening(true)
    setTimeout(() => {
      setIsVoiceListening(false)
      onSearchChange('Samsung Galaxy')
    }, 1800)
  }

  return (
    <div className="container" style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Search Input Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon name="search" size={17} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search devices, scrap, recyclers..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              <Icon name="close" size={14} color="var(--text-tertiary)" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            aria-label="Voice Search"
            style={{
              background: isVoiceListening ? 'var(--accent)' : 'var(--bg-surface-2)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isVoiceListening ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon name="sparkles" size={13} color={isVoiceListening ? '#fff' : 'var(--accent)'} />
          </button>
        </div>

        {/* Filter Trigger Button */}
        <button
          onClick={onFilterClick}
          aria-label="Filter"
          style={{
            background: activeFiltersCount > 0 ? 'var(--accent)' : 'var(--bg-surface)',
            color: activeFiltersCount > 0 ? '#fff' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.82rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon name="filter" size={16} color={activeFiltersCount > 0 ? '#fff' : 'var(--text-secondary)'} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: 'rgba(255,255,255,0.3)',
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: 10,
                fontWeight: 800
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {isVoiceListening && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 12px',
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: 'var(--accent-text)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            animation: 'pulse 1.5s infinite'
          }}
        >
          <Icon name="sparkles" size={13} color="var(--accent)" />
          <span>Listening... Try saying "Samsung Galaxy" or "Li-Ion Battery"</span>
        </div>
      )}
    </div>
  )
}
