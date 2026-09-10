import { useState } from 'react'
import { Card, Badge, Button } from '../../components/ui'

export default function RecyclerPage() {
  const [pickups, setPickups] = useState([
    { id: 'PK-991', client: 'PSG Tech Campus', items: '50+ Devices (120kg)', slot: 'Tomorrow 10:00 AM', status: 'Assigned Driver', vehicle: 'TN-38-BZ-4412 (Fire-Safe)' },
    { id: 'PK-992', client: 'Mathavan K.', items: 'Dell Laptop Battery Pack', slot: 'Today 11:30 AM', status: 'En Route', vehicle: 'TN-38-BZ-9021' },
    { id: 'PK-993', client: 'Coimbatore IT Park', items: '12 Server Racks & UPS', slot: 'Friday 2:00 PM', status: 'Scheduled', vehicle: 'Heavy Transport #4' },
  ])

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
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
            Authorized Recycler Logistics & Smelter Dispatch
          </h1>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            TNPCB License #TN-REC-4819 • Doorstep Hazardous Fleet Manager
          </div>
        </div>
        <Badge variant="green" size="sm">
          Certified Facility
        </Badge>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Logistics Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>3</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pickups Today</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>148.5 kg</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Manifest Weight</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--coin-color)' }}>100%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Chain of Custody</div>
          </div>
        </div>

        {/* Pickup Dispatch List */}
        <Card>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Active Logistics & Certificate Issuance Dispatch
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pickups.map(p => (
              <div
                key={p.id}
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
                      {p.client}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {p.items} • <strong>{p.slot}</strong>
                    </div>
                  </div>
                  <Badge variant={p.status === 'En Route' ? 'green' : p.status === 'Assigned Driver' ? 'blue' : 'amber'} size="sm">
                    {p.status}
                  </Badge>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                  Vehicle: {p.vehicle}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {p.status === 'En Route' && (
                    <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(p.id, 'Collected & Weighed')}>
                      Confirm Safe Collection
                    </Button>
                  )}
                  {p.status === 'Assigned Driver' && (
                    <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(p.id, 'En Route')}>
                      Dispatch Fleet Driver
                    </Button>
                  )}
                  {p.status === 'Collected & Weighed' && (
                    <Button size="sm" variant="ghost" onClick={() => alert(`Official TNPCB certificate generated for ${p.client}.`)}>
                      Issue Digital Certificate
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
