import { useState, useEffect } from 'react'
import { shopService, type ShopAnalyticsData } from '../../../services/shop/shopService'

export default function ShopAnalytics() {
  const [data, setData] = useState<ShopAnalyticsData>({
    totalCollections: 0,
    totalItems: 0,
    completedPickups: 0,
    pendingPickups: 0,
    estimatedValue: 0,
    totalWeightKg: 0,
    categoryBreakdown: [],
  })
  const [timePeriod, setTimePeriod] = useState<'Today' | 'This Week' | 'This Month'>('This Month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await shopService.getAnalytics()
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate analytics from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const co2DivertedKg = Math.round(data.totalWeightKg * 1.44)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header & Time Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Business Analytics & Environmental Impact
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time throughput calculated directly from public.pickup_requests & e_waste_posts
          </p>
        </div>

        {/* Time Period Filter */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {(['Today', 'This Week', 'This Month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setTimePeriod(p)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: timePeriod === p ? '#F97316' : 'transparent',
                color: timePeriod === p ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: timePeriod === p ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Total Collections
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
            {loading ? '...' : data.totalCollections}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Devices collected & diverted</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Completed Pickups
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#22C55E', margin: '8px 0 4px' }}>
            {loading ? '...' : data.completedPickups}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Confirmed doorstep runs</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Pending Pickups
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', margin: '8px 0 4px' }}>
            {loading ? '...' : data.pendingPickups}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Awaiting action</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            E-Waste Diverted
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FB923C', margin: '8px 0 4px' }}>
            {loading ? '...' : `${data.totalWeightKg} kg`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Landfill diversion estimate</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            CO₂e Offset Impact
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#22C55E', margin: '8px 0 4px' }}>
            {loading ? '...' : `${co2DivertedKg} kg`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Calculated lifecycle savings</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          E-Waste Category Breakdown
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0 0 20px' }}>
          Distribution of items by category in community listings and inventory
        </p>

        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Calculating distribution...
          </div>
        ) : data.categoryBreakdown.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
            Data unavailable. Post community e-waste items to generate breakdown.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.categoryBreakdown.map(cat => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {cat.count} items ({cat.percentage}%)
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      background: 'linear-gradient(90deg, #F97316, #22C55E)',
                      borderRadius: 5,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
