import { Card, Badge } from '../../components/ui'

export default function AdminPage() {
  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            TNPCB Regulatory & State Governance Portal
          </h1>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Tamil Nadu Pollution Control Board • Circular Compliance Stream
          </div>
        </div>
        <Badge variant="green" size="sm">
          Node Active
        </Badge>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Compliance Telemetry Metric Cards */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Live Regional Regulatory Metrics (Coimbatore District)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg-surface-2)', padding: '14px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>14</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Authorized Recyclers</div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '14px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>1,420 kg</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Monthly Diverted</div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '14px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>99.2%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Traceability Verified</div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '14px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--coin-color)' }}>100%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>TNPCB Compliance</div>
            </div>
          </div>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
            Recent Certified Recycling Transits
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'TN-TX-8812', partner: 'GreenCycle Hub RS Puram', weight: '48.5 kg', date: 'Today 14:20', status: 'Sealed & Weighed' },
              { id: 'TN-TX-8811', partner: 'Coimbatore EcoSmelt Tech', weight: '124.0 kg', date: 'Today 11:15', status: 'Certificate Issued' },
              { id: 'TN-TX-8810', partner: 'CleanCircuit E-Waste Ltd', weight: '18.2 kg', date: 'Yesterday', status: 'Audit Passed' },
            ].map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.partner}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{tx.id} • {tx.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--accent)' }}>{tx.weight}</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
