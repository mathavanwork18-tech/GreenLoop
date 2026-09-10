import { useState, useRef, useEffect } from 'react'

export type MapCategoryFilter = 'all' | 'items' | 'parts' | 'shops' | 'centers'

interface MapFiltersProps {
  activeCategory: MapCategoryFilter
  onCategoryChange: (category: MapCategoryFilter) => void
  activeRadius: number
  onRadiusChange: (radius: number) => void
}

export default function MapFilters({
  activeCategory,
  onCategoryChange,
  activeRadius,
  onRadiusChange,
}: MapFiltersProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categories: { id: MapCategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'items', label: 'Items', icon: '📦' },
    { id: 'parts', label: 'Parts', icon: '🔧' },
    { id: 'shops', label: 'Shops', icon: '🏪' },
    { id: 'centers', label: 'Centers', icon: '♻️' },
  ]

  const radiusOptions = [1, 5, 10, 25, 50]

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
    <div className="map-filter-row">
      {/* Category Filter Chips */}
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`map-filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}

      {/* Compact Radius Dropdown Control */}
      <div className="map-radius-control" ref={dropdownRef}>
        <button
          className="map-radius-btn"
          onClick={() => setDropdownOpen(prev => !prev)}
          aria-label="Select radius"
        >
          <span>{activeRadius} km ▾</span>
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
                {r} km
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
