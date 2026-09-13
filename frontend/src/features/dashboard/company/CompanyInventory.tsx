import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import Icon from '../../../components/Icon'

export default function CompanyInventory() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadInventory = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('pickup_requests')
        .select('id, description, quantity, status, scheduled_date, created_at')
        .order('created_at', { ascending: false })

      setItems(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Enterprise Material Inventory
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bulk e-waste lots, segregated PCB scrap, and certified battery stockpiles
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

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading enterprise inventory...
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="package" size={24} color="#059669" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            0 Bulk Items in Inventory
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            No bulk e-waste stockpiles currently logged. Completed pickups will be inventoried automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  Lot #{item.id.slice(0, 6)}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(5, 150, 105, 0.12)',
                    color: '#059669',
                  }}
                >
                  {item.status}
                </span>
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {item.description}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Intake Volume: <strong>{item.quantity} bulk units</strong> (~{Math.round((item.quantity || 1) * 8.5)} kg)
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Received: {item.scheduled_date || 'Recent intake'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
