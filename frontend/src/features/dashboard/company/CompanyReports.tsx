import { useState, useEffect } from 'react'
import { companyService, type CompanyReportSummary } from '../../../services/company/companyService'
import Icon from '../../../components/Icon'

export default function CompanyReports() {
  const [reports, setReports] = useState<CompanyReportSummary[]>([])
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await companyService.getComplianceReports()
      setReports(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Regulatory Compliance & Manifest Reports
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Tamper-evident audit logs and statutory manifests for TNPCB and Central Pollution Control Board (CPCB)
          </p>
        </div>
        <button
          onClick={loadReports}
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
          Generating compliance manifests...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map(rep => (
            <div key={rep.manifestId} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {rep.manifestId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                      }}
                    >
                      {rep.complianceStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Period: {rep.reportingPeriod}
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  Generated: {rep.generatedAt}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-2)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Total E-Waste Diverted</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669' }}>
                    {rep.totalDivertedKg.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Hazardous Fractions Isolated</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>
                    {rep.hazardousNeutralizedKg.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Precious Metal Yield</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f59e0b' }}>
                    {rep.preciousMetalsRecoveredGrams.toLocaleString()} grams
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
