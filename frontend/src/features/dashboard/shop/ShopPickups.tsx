import { useState, useEffect } from 'react'
import { shopService, type ShopPickupItem } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function ShopPickups() {
  const [pickups, setPickups] = useState<ShopPickupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')

  const loadPickups = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopService.getPickupRequests(100)
      setPickups(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load pickup requests from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPickups()
  }, [])

  const handleStatus = async (
    requestId: string,
    newStatus: 'pending' | 'accepted' | 'scheduled' | 'collected' | 'completed' | 'rejected'
  ) => {
    setActionId(requestId)
    try {
      await shopService.updatePickupRequestStatus(requestId, newStatus)
      await loadPickups()
    } catch (err: any) {
      alert(`Status update failed: ${err?.message || 'Database error'}`)
    } finally {
      setActionId(null)
    }
  }

  const tabs = ['all', 'pending', 'accepted', 'collected', 'completed', 'rejected']

  const filtered = pickups.filter(p => {
    if (activeTab === 'all') return true
    return p.status === activeTab
  })

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Pickup Request Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Review, dispatch, collect, and confirm doorstep e-waste pickups
          </p>
        </div>
        <button
          onClick={loadPickups}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 18 }}>
        {tabs.map(t => {
          const isSel = activeTab === t
          const count = t === 'all' ? pickups.length : pickups.filter(p => p.status === t).length
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: isSel ? '1px solid #F97316' : '1px solid var(--border-color)',
                background: isSel ? 'rgba(249, 115, 22, 0.12)' : 'var(--bg-surface)',
                color: isSel ? '#FB923C' : 'var(--text-secondary)',
                fontWeight: isSel ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{t}</span>
              <span
                style={{
                  background: isSel ? '#F97316' : 'var(--bg-surface-2)',
                  color: isSel ? '#ffffff' : 'var(--text-tertiary)',
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

      {error && (
        <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading pickup requests from Supabase...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.10)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="pickup" size={24} color="#FB923C" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            No pickup requests found
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            {activeTab === 'all'
              ? 'There are currently 0 pickup requests in the database.'
              : `No requests with status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(req => {
            const isProcessing = actionId === req.id
            return (
              <div
                key={req.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 900, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                      {req.customerName}
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
                            : req.status === 'collected'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : req.status === 'completed'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(107, 114, 128, 0.15)',
                        color:
                          req.status === 'pending'
                            ? '#f59e0b'
                            : req.status === 'accepted'
                            ? '#FB923C'
                            : req.status === 'collected'
                            ? '#22C55E'
                            : req.status === 'completed'
                            ? '#22C55E'
                            : '#6b7280',
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <strong>Items:</strong> {req.itemsDescription} ({req.quantity} {req.quantity === 1 ? 'item' : 'items'})
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                    <span>City: {req.customerCity}</span>
                    <span>Phone: {req.customerPhone}</span>
                    <span>Scheduled: {req.scheduledDate}</span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatus(req.id, 'accepted')}
                        disabled={isProcessing}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.78rem', background: '#F97316', border: 'none' }}
                      >
                        {isProcessing ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleStatus(req.id, 'rejected')}
                        disabled={isProcessing}
                        className="btn btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '0.78rem', color: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => handleStatus(req.id, 'collected')}
                      disabled={isProcessing}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.78rem', background: '#22C55E', border: 'none' }}
                    >
                      {isProcessing ? 'Updating...' : 'Mark Collected'}
                    </button>
                  )}

                  {req.status === 'collected' && (
                    <button
                      onClick={() => handleStatus(req.id, 'completed')}
                      disabled={isProcessing}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.78rem', background: '#10b981', border: 'none' }}
                    >
                      {isProcessing ? 'Updating...' : 'Complete & Log'}
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="check" size={14} color="#10b981" />
                      Archived in Disposal Logs
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
