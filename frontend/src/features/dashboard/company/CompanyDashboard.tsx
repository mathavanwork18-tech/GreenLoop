import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { companyService, type CompanyStats } from '../../../services/company/companyService'
import Icon from '../../../components/Icon'

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<CompanyStats>({
    totalCollections: 0,
    pendingRequests: 0,
    processingItems: 0,
    completedCollections: 0,
    estimatedBusinessValue: 0,
    divertedEWasteKg: 0,
    co2OffsetKg: 0,
  })
  const [recentActivity, setRecentActivity] = useState<{ id: string; title: string; time: string; stage: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await companyService.getDashboardOverview(user?.id || '')
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
    } catch (err: any) {
      console.error('[Green Loop] Company dashboard error:', err)
      setError(err?.message || 'Failed to load enterprise data from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1240, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header */}
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
              Enterprise Operations Dashboard
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(5, 150, 105, 0.12)',
                color: '#059669',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
              Facility Online · TNPCB Certified
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Industrial Recycling, Bulk Material Refining, and Manifest Tracking · {user?.name || 'Recycling Partner'}
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
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.84rem', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* 6 Enterprise Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" onClick={() => navigate('/company/requests')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Total Collections
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 2px' }}>
            {loading ? '...' : stats.totalCollections}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Certified batches received</div>
        </div>

        <div className="card" onClick={() => navigate('/company/requests')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Pending Requests
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', margin: '8px 0 2px' }}>
            {loading ? '...' : stats.pendingRequests}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>Awaiting facility intake</div>
        </div>

        <div className="card" onClick={() => navigate('/company/processing')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Processing Items
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb', margin: '8px 0 2px' }}>
            {loading ? '...' : stats.processingItems}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>Active in refining stages</div>
        </div>

        <div className="card" onClick={() => navigate('/company/processing')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Completed Collections
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', margin: '8px 0 2px' }}>
            {loading ? '...' : stats.completedCollections}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Manifests completed</div>
        </div>

        <div className="card" onClick={() => navigate('/company/analytics')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Estimated Business Value
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8b5cf6', margin: '8px 0 2px' }}>
            {loading ? '...' : `₹${stats.estimatedBusinessValue.toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700 }}>Precious metals & fractions</div>
        </div>

        <div className="card" onClick={() => navigate('/company/reports')} style={{ padding: 18, cursor: 'pointer', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Diverted E-Waste
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#06b6d4', margin: '8px 0 2px' }}>
            {loading ? '...' : `${stats.divertedEWasteKg} kg`}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 700 }}>CO₂e offset: {stats.co2OffsetKg} kg</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Pipeline Quick Links & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Left: Quick Actions & Processing Pipeline Overview */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Circular Processing Pipeline
          </h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
            Enterprise recycling stream status (Collected → Sorting → Processing → Reusable → Completed)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              onClick={() => navigate('/company/processing')}
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-2)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="refresh" size={18} color="#059669" />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  View Active Processing Pipeline
                </span>
              </div>
              <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
            </div>

            <div
              onClick={() => navigate('/company/requests')}
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-2)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="pickup" size={18} color="#2563eb" />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Manage Bulk Collection Requests
                </span>
              </div>
              <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
            </div>

            <div
              onClick={() => navigate('/company/reports')}
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-2)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={18} color="#10b981" />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Generate TNPCB Compliance Manifests
                </span>
              </div>
              <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Recent Facility Activity
          </h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
            Operational logging from public.disposal_logs
          </p>

          {loading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Loading facility logs...
            </div>
          ) : recentActivity.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
              No facility activity recorded yet.
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
                      background: 'rgba(5, 150, 105, 0.1)',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={16} color="#059669" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {act.time} · Stage: <strong>{act.stage}</strong>
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
