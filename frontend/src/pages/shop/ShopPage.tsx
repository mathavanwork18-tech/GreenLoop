import { useState } from 'react'
import Icon from '../../components/Icon'

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
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 24px)',
        width: '100%',
        backgroundColor: '#07100A',
        minHeight: '100dvh',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#07100A',
          borderBottom: '1px solid #203526',
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
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#F5F7F5' }}>
            Repair & Component Shop Hub
          </h1>
          <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>
            Local electronics repair jobs, diagnostic quotes, and parts harvesting
          </div>
        </div>
        <span
          className="gl-shop-badge-verified"
          style={{
            background: 'rgba(34, 197, 94, 0.10)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: '#22C55E',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 800,
          }}
        >
          Shop Verified
        </span>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Queue Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div
            className="gl-shop-card"
            style={{
              background: '#0D1710',
              border: '1px solid #203526',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E' }}>3</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3A5', marginTop: 2 }}>Active Jobs</div>
          </div>
          <div
            className="gl-shop-card"
            style={{
              background: '#0D1710',
              border: '1px solid #203526',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FB923C' }}>₹5,700</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3A5', marginTop: 2 }}>Weekly Pipeline</div>
          </div>
          <div
            className="gl-shop-card"
            style={{
              background: '#0D1710',
              border: '1px solid #203526',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span>4.9</span>
              <Icon name="star" size={14} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3A5', marginTop: 2 }}>Rating</div>
          </div>
        </div>

        {/* Requests List */}
        <div
          className="gl-shop-card"
          style={{
            background: '#0D1710',
            border: '1px solid #203526',
            borderRadius: 'var(--radius-lg)',
            padding: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F5F7F5', marginBottom: 14 }}>
            Incoming Repair & Component Harvesting Requests
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(r => (
              <div
                key={r.id}
                style={{
                  padding: 14,
                  background: '#111F14',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #203526',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F5F7F5', margin: 0 }}>
                      {r.device}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>
                      Customer: <strong style={{ color: '#F5F7F5' }}>{r.customer}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FB923C' }}>{r.budget}</div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background:
                          r.status === 'Pending Quote'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : r.status === 'In Repair'
                            ? 'rgba(249, 115, 22, 0.12)'
                            : 'rgba(34, 197, 94, 0.10)',
                        border:
                          r.status === 'Pending Quote'
                            ? '1px solid rgba(245, 158, 11, 0.35)'
                            : r.status === 'In Repair'
                            ? '1px solid rgba(249, 115, 22, 0.35)'
                            : '1px solid rgba(34, 197, 94, 0.35)',
                        color:
                          r.status === 'Pending Quote'
                            ? '#F59E0B'
                            : r.status === 'In Repair'
                            ? '#FB923C'
                            : '#22C55E',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#9CA3A5',
                    margin: '6px 0 12px',
                    background: '#0D1710',
                    border: '1px solid #203526',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Issue: {r.fault}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {r.status === 'Pending Quote' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'In Repair')}
                      className="gl-shop-btn-post"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      Accept & Send Quote
                    </button>
                  )}
                  {r.status === 'In Repair' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Parts Ready')}
                      className="gl-shop-btn-eco"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      Mark Diagnostics Done
                    </button>
                  )}
                  {r.status === 'Parts Ready' && (
                    <button
                      onClick={() => alert('Harvested parts cataloged into spare parts inventory.')}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#111F14',
                        border: '1px solid #203526',
                        color: '#22C55E',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      Catalog to Store
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
