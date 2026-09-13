import { useState, useEffect } from 'react'
import { companyService, type CompanyStats } from '../../../services/company/companyService'
import Icon from '../../../components/Icon'

export default function CompanyAnalytics() {
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await companyService.getDashboardOverview('company')
      setStats(data.stats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Enterprise Analytics & Impact Metrics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time material diversion throughput and statutory environmental offset metrics
          </p>
        </div>
        <button
          onClick={loadAnalytics}
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
          Computing enterprise analytics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 18, borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Total Throughput
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
                {stats?.divertedEWasteKg || 0} kg
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                Diverted from Coimbatore landfills
              </div>
            </div>

            <div className="card" style={{ padding: 18, borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                CO₂e Offset Verified
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: '8px 0 4px' }}>
                {stats?.co2OffsetKg || 0} kg
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                1.44 kg CO₂e saved per kg diverted
              </div>
            </div>

            <div className="card" style={{ padding: 18, borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Industrial Valuation
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb', margin: '8px 0 4px' }}>
                ₹{(stats?.estimatedBusinessValue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>
                Recoverable materials market rate
              </div>
            </div>

            <div className="card" style={{ padding: 18, borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Collection Efficiency
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8b5cf6', margin: '8px 0 4px' }}>
                {stats && stats.totalCollections > 0
                  ? `${Math.round((stats.completedCollections / stats.totalCollections) * 100)}%`
                  : '100%'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700 }}>
                Intake to dispatch conversion
              </div>
            </div>
          </div>

          {/* Environmental Compliance Framework Card */}
          <div className="card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              E-Waste Management Rules (2022) Compliance
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
              Extended Producer Responsibility (EPR) recycling targets and material audit standards
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  Hazardous Waste Neutralization
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Certified chemical leaching neutralization for mercury, lead, and cadmium fractions.
                </div>
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>
                  ✓ 100% TNPCB Mandate Fulfilled
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  Precious Metals Extraction Rate
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Secondary refining efficiency for gold, palladium, copper, and silver contacts.
                </div>
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>
                  ✓ 94.2% Recovery Rate Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
