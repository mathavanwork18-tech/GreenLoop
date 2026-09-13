import { useState, useEffect } from 'react'
import { shopService, type ShopInventoryItem } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function ShopInventory() {
  const [items, setItems] = useState<ShopInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const loadInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopService.getInventory()
      setItems(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const statuses = ['all', 'Received', 'Sorting', 'Ready for Resale', 'Ready for Recycling', 'Processed']

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true
    return item.status === activeFilter
  })

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            E-Waste Inventory
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time stock of collected devices, components, and refurbishment items
          </p>
        </div>
        <button
          onClick={loadInventory}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
        {statuses.map(st => {
          const count = st === 'all' ? items.length : items.filter(i => i.status === st).length
          const isSelected = activeFilter === st
          return (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                color: isSelected ? '#2563eb' : 'var(--text-secondary)',
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{st === 'all' ? 'All Items' : st}</span>
              <span
                style={{
                  background: isSelected ? '#2563eb' : 'var(--bg-surface-2)',
                  color: isSelected ? '#ffffff' : 'var(--text-tertiary)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: '0.68rem',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading inventory items from Supabase...
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="package" size={24} color="#2563eb" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            0 items in inventory
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            {activeFilter === 'all'
              ? 'No items currently in inventory. Accept pickup requests to collect e-waste.'
              : `No items found matching status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        /* Inventory Table / Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredItems.map(item => (
            <div key={item.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      item.status === 'Ready for Resale'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : item.status === 'Sorting'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(37, 99, 235, 0.15)',
                    color:
                      item.status === 'Ready for Resale'
                        ? '#10b981'
                        : item.status === 'Sorting'
                        ? '#f59e0b'
                        : '#2563eb',
                  }}
                >
                  {item.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Condition: <strong>{item.condition}</strong></span>
                <span>Est. Value: <strong style={{ color: '#2563eb' }}>₹{item.estimatedValue.toLocaleString()}</strong></span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Source: {item.source}</span>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
