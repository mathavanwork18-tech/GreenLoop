import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { shopService, type ShopSummaryStats, type ShopPickupItem } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function ShopDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<ShopSummaryStats>({
    pendingRequests: 0,
    inventoryItems: 0,
    completedCollections: 0,
    estimatedValue: 0,
  })
  const [recentRequests, setRecentRequests] = useState<ShopPickupItem[]>([])
  const [recentActivity, setRecentActivity] = useState<{ id: string; title: string; time: string; type: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopService.getDashboardOverview(user?.id || '')
      setStats(data.stats)
      setRecentRequests(data.recentRequests)
      setRecentActivity(data.recentActivity)
    } catch (err: any) {
      console.error('[Green Loop] Error loading shop dashboard:', err)
      setError(err?.message || 'Failed to connect to Supabase database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoading(requestId)
    try {
      await shopService.updatePickupRequestStatus(requestId, newStatus)
      await loadData()
    } catch (err: any) {
      alert(`Could not update pickup request: ${err?.message || 'Database error'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Greeting helper
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const shopName = user?.name || 'Local Shop Recyclers'

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Banner & Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              {greeting}, {shopName}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Active / Available
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Neighborhood Electronics Hub & Recycler Operations · {user?.city || 'Coimbatore'}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>{loading ? 'Refreshing...' : 'Refresh Supabase Data'}</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '0.84rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="alert" size={16} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Summary Cards (from real database queries) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Card 1: Pending Requests */}
        <div
          className="card"
          onClick={() => navigate('/shop/pickups')}
          style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Pending Requests
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Icon name="pickup" size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {loading ? '...' : stats.pendingRequests}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>
            Awaiting shop confirmation
          </div>
        </div>

        {/* Card 2: Inventory Items */}
        <div
          className="card"
          onClick={() => navigate('/shop/inventory')}
          style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #F97316' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Inventory Items
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.1)' }}>
              <Icon name="package" size={18} color="#FB923C" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {loading ? '...' : stats.inventoryItems}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#FB923C', fontWeight: 700, marginTop: 4 }}>
            Categorized & ready in stock
          </div>
        </div>

        {/* Card 3: Completed Collections */}
        <div
          className="card"
          onClick={() => navigate('/shop/transactions')}
          style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #10b981' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Completed Collections
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)' }}>
              <Icon name="check" size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {loading ? '...' : stats.completedCollections}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: 4 }}>
            Successfully recycled / repaired
          </div>
        </div>

        {/* Card 4: Estimated Value */}
        <div
          className="card"
          onClick={() => navigate('/shop/analytics')}
          style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Estimated Value
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)' }}>
              <Icon name="coin" size={18} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {loading ? '...' : `₹${stats.estimatedValue.toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700, marginTop: 4 }}>
            Stock & collection asset value
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Recent Requests & Today's Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Left Column: Recent Pickup Requests */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Recent Pickup Requests
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Citizen e-waste requests from public.pickup_requests
              </span>
            </div>
            <button
              onClick={() => navigate('/shop/pickups')}
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Loading pickup requests from Supabase...
            </div>
          ) : recentRequests.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
              No pickup requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentRequests.map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {req.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {req.customerCity} · {req.scheduledDate}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background:
                          req.status === 'pending'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : req.status === 'accepted'
                            ? 'rgba(249, 115, 22, 0.15)'
                            : req.status === 'completed'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(107, 114, 128, 0.15)',
                        color:
                          req.status === 'pending'
                            ? '#f59e0b'
                            : req.status === 'accepted'
                            ? '#FB923C'
                            : req.status === 'completed'
                            ? '#22C55E'
                            : '#6b7280',
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {req.itemsDescription} ({req.quantity} {req.quantity === 1 ? 'item' : 'items'})
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'accepted')}
                        disabled={actionLoading === req.id}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.76rem', background: '#F97316', border: 'none' }}
                      >
                        {actionLoading === req.id ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        disabled={actionLoading === req.id}
                        className="btn btn-ghost"
                        style={{ padding: '6px 14px', fontSize: '0.76rem', color: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Activity */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Today's Activity
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Real events logged in public.disposal_logs
              </span>
            </div>
            <button
              onClick={() => navigate('/shop/transactions')}
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              History
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Loading activity log...
            </div>
          ) : recentActivity.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
              No activity yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map(act => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-2)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.10)',
                      color: '#22C55E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={16} color="#22C55E" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
