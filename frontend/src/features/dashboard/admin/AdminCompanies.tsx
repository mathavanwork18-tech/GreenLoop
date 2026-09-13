import { useEffect, useState } from 'react'
import { adminService, type AdminUserRecord } from './services/adminService'
import Icon from '../../../components/Icon'

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getUsers('company').then((data) => {
      setCompanies(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Recycling Companies & Enterprise Recyclers
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Certified bulk e-waste recovery facilities, R2/E-Stewards partners, and EPR handlers.
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
            Registered Recycling Enterprises ({companies.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
            EPR & TNPCB Compliance Active
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading enterprises...</div>
        ) : companies.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No recycling companies registered yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {companies.map((c) => (
              <div
                key={c.id}
                style={{
                  backgroundColor: '#16221c',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: 'rgba(167, 139, 250, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a78bfa',
                    }}
                  >
                    <Icon name="recycle" size={18} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{c.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>Authorized Enterprise Recycler</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>City: <strong>{c.city || 'Coimbatore'}</strong></div>
                  <div>Contact: <strong>{c.phone || 'Enterprise desk'}</strong></div>
                  <div>Registered: <strong>{new Date(c.created_at).toLocaleDateString()}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
