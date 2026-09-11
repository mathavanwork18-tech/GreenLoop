import { useState, useRef, useEffect } from 'react'
import Icon, { type IconName } from '../Icon'

export type MapCategoryFilter = 'all' | 'nearest' | 'coimbatore' | 'items'

interface MapFiltersProps {
  activeCategory: MapCategoryFilter
  onCategoryChange: (category: MapCategoryFilter) => void
  activeRadius: number
  onRadiusChange: (radius: number) => void
  hasLocationPermission: boolean
}

export default function MapFilters({
  activeCategory,
  onCategoryChange,
  activeRadius,
  onRadiusChange,
  hasLocationPermission,
}: MapFiltersProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categories: { id: MapCategoryFilter; label: string; icon: IconName; requiresLocation?: boolean }[] = [
    { id: 'all', label: 'All Centers', icon: 'map' },
    { id: 'nearest', label: 'Nearest', icon: 'location-pin', requiresLocation: true },
    { id: 'coimbatore', label: 'Coimbatore', icon: 'building' },
    { id: 'items', label: 'Community Posts', icon: 'refresh' },
  ]

  const radiusOptions = [5, 10, 20, 35, 50]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  return (
    <div className="map-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {/* Filter Chips (Zero emojis — 100% SVG Icons) */}
      {categories.map(cat => {
        const isActive = activeCategory === cat.id
        const isDisabled = cat.requiresLocation && !hasLocationPermission

        return (
          <button
            key={cat.id}
            onClick={() => {
              if (isDisabled) return
              onCategoryChange(cat.id)
            }}
            disabled={isDisabled}
            className={`map-filter-chip ${isActive ? 'active' : ''}`}
            title={isDisabled ? 'Enable location to sort by nearest' : undefined}
            style={{
              opacity: isDisabled ? 0.45 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon name={cat.icon} size={14} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
            <span>{cat.label}</span>
          </button>
        )
      })}

      {/* Radius Selector */}
      <div className="map-radius-control" ref={dropdownRef} style={{ marginLeft: 'auto' }}>
        <button
          className="map-radius-btn"
          onClick={() => setDropdownOpen(prev => !prev)}
          aria-label="Filter radius"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Icon name="search" size={12} color="var(--accent)" />
          <span>{activeRadius} km</span>
        </button>

        {dropdownOpen && (
          <div className="map-radius-menu">
            {radiusOptions.map(r => (
              <button
                key={r}
                onClick={() => {
                  onRadiusChange(r)
                  setDropdownOpen(false)
                }}
                className={`map-radius-option ${activeRadius === r ? 'selected' : ''}`}
              >
                Within {r} km
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
