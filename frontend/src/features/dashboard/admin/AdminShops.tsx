import { useEffect, useState } from 'react'
import { adminService, type AdminUserRecord } from './services/adminService'
import Icon from '../../../components/Icon'

export default function AdminShops() {
  const [shops, setShops] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getUsers('shop').then((data) => {
      setShops(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Local Shop Network
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Electronics repair shops, refurbishment centers, and local circular traders.
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
            Registered Local Shops ({shops.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
            TNPCB Shop Certification Enabled
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading shops...</div>
        ) : shops.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No local shops registered yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {shops.map((s) => (
              <div
                key={s.id}
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
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Icon name="shop" size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{s.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Verified Local Shop</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>City: <strong>{s.city || 'Coimbatore'}</strong></div>
                  <div>Phone: <strong>{s.phone || 'Contact on file'}</strong></div>
                  <div>Joined: <strong>{new Date(s.created_at).toLocaleDateString()}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
