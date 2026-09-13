import { useState, useEffect } from 'react'
import { companyService, type CompanyCollectionRequest } from '../../../services/company/companyService'
import { shopService } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function CompanyRequests() {
  const [requests, setRequests] = useState<CompanyCollectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await companyService.getCollectionRequests()
      setRequests(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load enterprise requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleUpdate = async (id: string, newStatus: any) => {
    setActionId(id)
    try {
      await shopService.updatePickupRequestStatus(id, newStatus)
      await loadRequests()
    } catch (err: any) {
      alert(`Update error: ${err?.message || 'Failed to update'}`)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Bulk Collection Requests
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Enterprise IT decommissioning and institutional e-waste collection runs
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading collection requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="pickup" size={24} color="#059669" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            No collection requests found
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            No bulk e-waste collection requests currently pending in public.pickup_requests.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {requests.map(req => (
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
                    {req.clientName}
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background:
                        req.status === 'completed'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : req.status === 'accepted'
                          ? 'rgba(5, 150, 105, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        req.status === 'completed'
                          ? '#10b981'
                          : req.status === 'accepted'
                          ? '#059669'
                          : '#f59e0b',
                    }}
                  >
                    {req.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <strong>Cargo:</strong> {req.description} ({req.quantity} {req.quantity === 1 ? 'batch' : 'batches'})
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  <span>Location: {req.location}</span>
                  <span>Scheduled: {req.scheduledDate}</span>
                  <span>Contact: {req.clientPhone}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {req.status === 'pending' && (
                  <button
                    onClick={() => handleUpdate(req.id, 'accepted')}
                    disabled={actionId === req.id}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', background: '#059669', border: 'none' }}
                  >
                    {actionId === req.id ? 'Updating...' : 'Authorize Dispatch'}
                  </button>
                )}
                {req.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdate(req.id, 'completed')}
                    disabled={actionId === req.id}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', background: '#10b981', border: 'none' }}
                  >
                    {actionId === req.id ? 'Updating...' : 'Confirm Facility Intake'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
