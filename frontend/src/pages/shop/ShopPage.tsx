import { useState } from 'react'
import { Card, Badge, Button } from '../../components/ui'

export default function ShopPage() {
  const [requests, setRequests] = useState([
    { id: '1', customer: 'Ravi M.', device: 'iPhone 11 (64GB)', fault: 'Battery health degraded 68%', budget: '₹1,800', status: 'Pending Quote' },
    { id: '2', customer: 'Deepa K.', device: 'HP Pavilion 15', fault: 'Broken hinge & trackpad ribbon', budget: '₹2,500', status: 'In Repair' },
    { id: '3', customer: 'Vignesh P.', device: 'Dell Inspiron 3593', fault: 'Harvest 8GB DDR4 RAM & 256GB SSD', budget: '₹1,400', status: 'Parts Ready' },
  ])

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      {/* Header */}
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
            Repair & Component Shop Hub
          </h1>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Local electronics repair jobs, diagnostic quotes, and parts harvesting
          </div>
        </div>
        <Badge variant="blue" size="sm">
          Shop Verified
        </Badge>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Queue Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>3</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Active Jobs</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>₹5,700</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Weekly Pipeline</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--coin-color)' }}>4.9 ★</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Rating</div>
          </div>
        </div>

        {/* Requests List */}
        <Card>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Incoming Repair & Component Harvesting Requests
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(r => (
              <div
                key={r.id}
                style={{
                  padding: 14,
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {r.device}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Customer: <strong>{r.customer}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>{r.budget}</div>
                    <Badge variant={r.status === 'Pending Quote' ? 'amber' : r.status === 'In Repair' ? 'blue' : 'green'} size="sm">
                      {r.status}
                    </Badge>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '6px 0 10px', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  Issue: {r.fault}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {r.status === 'Pending Quote' && (
                    <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(r.id, 'In Repair')}>
                      Accept & Send Quote
                    </Button>
                  )}
                  {r.status === 'In Repair' && (
                    <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(r.id, 'Parts Ready')}>
                      Mark Diagnostics Done
                    </Button>
                  )}
                  {r.status === 'Parts Ready' && (
                    <Button size="sm" variant="ghost" onClick={() => alert('Harvested parts cataloged into spare parts inventory.')}>
                      Catalog to Store
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
