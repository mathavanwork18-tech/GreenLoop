import { useState } from 'react'
import Icon from '../../../components/Icon'

export default function AdminReports() {
  const [reports, setReports] = useState([
    {
      id: 'rep_1',
      targetType: 'post',
      targetTitle: 'Cracked CRT Monitor',
      reporterName: 'Karthik S',
      reason: 'Hazardous cathode ray tube exposed without proper safety warning',
      status: 'pending',
      date: '2 hours ago',
    },
    {
      id: 'rep_2',
      targetType: 'user',
      targetTitle: 'Rapid Bulk Posting Account',
      reporterName: 'Green Scrap Hub',
      reason: 'Suspected duplicate non-e-waste spam items',
      status: 'pending',
      date: 'Yesterday',
    },
  ])

  const handleResolve = (id: string, action: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
    alert(`Report ${id} ${action}ed successfully.`)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Content & Safety Reports
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Community flagged listings, hazardous material alerts, and spam moderation.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
            Pending Moderation Queue ({reports.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
            Safety Filter Active
          </span>
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Icon name="check" size={32} color="#10b981" />
            <div style={{ marginTop: 8, fontWeight: 600 }}>All reports resolved! No pending flags.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reports.map((r) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: '#16221c',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        textTransform: 'uppercase',
                      }}
                    >
                      {r.targetType} Flag
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                      {r.targetTitle}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 4 }}>
                    "{r.reason}"
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Reported by <strong>{r.reporterName}</strong> • {r.date}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleResolve(r.id, 'dismiss')}
                  >
                    Dismiss
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                    onClick={() => handleResolve(r.id, 'suppress')}
                  >
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
