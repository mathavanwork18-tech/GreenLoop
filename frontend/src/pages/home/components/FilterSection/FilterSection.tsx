import { CATEGORIES, CONDITIONS } from '../../../../constants/categories'
import Icon from '../../../../components/Icon'

interface FilterSectionProps {
  isOpen: boolean
  onClose: () => void
  activeCategory: string
  onCategoryChange: (cat: string) => void
  activeCondition: string
  onConditionChange: (cond: string) => void
  activeDistance: string
  onDistanceChange: (dist: string) => void
  activeSort: string
  onSortChange: (sort: string) => void
  verifiedOnly: boolean
  onVerifiedOnlyChange: (v: boolean) => void
  onReset: () => void
}

export default function FilterSection({
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
  activeCondition,
  onConditionChange,
  activeDistance,
  onDistanceChange,
  activeSort,
  onSortChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  onReset
}: FilterSectionProps) {
  return (
    <>
      {/* Category Pills Bar (Always visible on Home) */}
      <div className="container" style={{ marginTop: 12 }}>
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 2
          }}
        >
          <button
            onClick={() => onCategoryChange('all')}
            style={{
              background: activeCategory === 'all' ? 'var(--accent)' : 'var(--bg-surface)',
              color: activeCategory === 'all' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.label)}
              style={{
                background: activeCategory === cat.label ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeCategory === cat.label ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Icon name={cat.icon} size={13} color={activeCategory === cat.label ? '#fff' : 'var(--text-secondary)'} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Bottom Sheet Modal */}
      {isOpen && (
        <>
          <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 120 }} />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--bg-surface)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '20px 20px 32px',
              zIndex: 130,
              boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
              animation: 'slide-up 0.25s ease',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Filter & Sort E-Waste
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="close" size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Condition */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Hardware Condition
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', ...CONDITIONS.map(c => c.label)].map(cond => (
                  <button
                    key={cond}
                    onClick={() => onConditionChange(cond)}
                    style={{
                      background: activeCondition === cond ? 'var(--accent)' : 'var(--bg-surface-2)',
                      color: activeCondition === cond ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cond === 'all' ? 'All Conditions' : cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Distance Radius
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'all', label: 'Anywhere' },
                  { id: '2km', label: 'Within 2 km' },
                  { id: '5km', label: 'Within 5 km' },
                  { id: '10km', label: 'Within 10 km' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => onDistanceChange(d.id)}
                    style={{
                      flex: 1,
                      background: activeDistance === d.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                      color: activeDistance === d.id ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Sort By
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'price_low', label: 'Price: Low' },
                  { id: 'price_high', label: 'Price: High' },
                  { id: 'distance', label: 'Nearest' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSortChange(s.id)}
                    style={{
                      flex: 1,
                      background: activeSort === s.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                      color: activeSort === s.id ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="verified" size={18} color="var(--accent)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verified Recyclers & KYC Sellers Only
                </span>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => onVerifiedOnlyChange(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onReset} className="btn btn-ghost btn-full" style={{ fontSize: '0.82rem' }}>
                Reset All
              </button>
              <button onClick={onClose} className="btn btn-primary btn-full" style={{ fontSize: '0.82rem' }}>
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
