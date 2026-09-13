import { useEffect, useState } from 'react'
import { adminService } from './services/adminService'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function AdminPickups() {
  const { user: currentAdmin } = useAuth()
  const [pickups, setPickups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPickups = async () => {
    setLoading(true)
    const list = await adminService.getPickupRequests()
    setPickups(list)
    setLoading(false)
  }

  useEffect(() => {
    loadPickups()
  }, [])

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (!currentAdmin?.id) return
    const ok = await adminService.updatePickupStatus(
      { id: currentAdmin.id, name: currentAdmin.name },
      requestId,
      newStatus
    )
    if (ok) {
      setPickups((prev) => prev.map((p) => (p.id === requestId ? { ...p, status: newStatus } : p)))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Doorstep Collection & Pickup Logistics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Scheduled pickups across Coimbatore and Tamil Nadu. Monitor logistics dispatch.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadPickups}>
          <Icon name="recycle" size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Scheduled Date</th>
              <th style={{ padding: '12px 16px' }}>Citizen / Origin</th>
              <th style={{ padding: '12px 16px' }}>City & Address</th>
              <th style={{ padding: '12px 16px' }}>Qty / Desc</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Dispatch Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Loading pickup requests from Supabase...
                </td>
              </tr>
            ) : pickups.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  No pickup requests recorded in database yet.
                </td>
              </tr>
            ) : (
              pickups.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#38bdf8' }}>
                    {p.scheduled_date}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{p.profiles?.full_name || 'Member'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.profiles?.phone || ''}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{p.profiles?.city || 'Coimbatore'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.profiles?.address || 'Doorstep'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{p.quantity || 1} items</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.description || 'E-waste'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor:
                          p.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : p.status === 'in_transit'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          p.status === 'completed'
                            ? '#34d399'
                            : p.status === 'in_transit'
                            ? '#38bdf8'
                            : '#fbbf24',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      style={{
                        backgroundColor: '#16221c',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        borderRadius: 6,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_transit">In Transit</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
