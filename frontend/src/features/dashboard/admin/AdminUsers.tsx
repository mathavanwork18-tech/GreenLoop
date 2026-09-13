import { useEffect, useState, type FormEvent } from 'react'
import { adminService, type AdminUserRecord } from './services/adminService'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const list = await adminService.getUsers(filterRole, search)
    setUsers(list)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [filterRole])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!currentAdmin?.id) return
    setUpdatingId(userId)
    const ok = await adminService.updateUserRole(
      { id: currentAdmin.id, name: currentAdmin.name },
      userId,
      newRole
    )
    if (ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    }
    setUpdatingId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            User Management Directory
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Registered Green Loop members across General Users, Shops, Recyclers, and Admins.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadUsers}>
          <Icon name="recycle" size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
          backgroundColor: '#0f1713',
          padding: 14,
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <input
            className="input"
            placeholder="Search users by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: 38, fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'citizen', 'shop', 'company', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 700,
                border: filterRole === r ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                background: filterRole === r ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: filterRole === r ? '#34d399' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
              <th style={{ padding: '12px 16px' }}>User Name</th>
              <th style={{ padding: '12px 16px' }}>City</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              <th style={{ padding: '12px 16px' }}>Active Role</th>
              <th style={{ padding: '12px 16px' }}>Joined Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Role Control</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Loading real profiles from Supabase database...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                    {u.full_name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{u.city || 'Coimbatore'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background:
                          u.role === 'admin'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : u.role === 'shop'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : u.role === 'company'
                            ? 'rgba(167, 139, 250, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        color:
                          u.role === 'admin'
                            ? '#f87171'
                            : u.role === 'shop'
                            ? '#38bdf8'
                            : u.role === 'company'
                            ? '#a78bfa'
                            : '#34d399',
                        textTransform: 'uppercase',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.76rem' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
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
                      <option value="citizen">Citizen</option>
                      <option value="shop">Local Shop</option>
                      <option value="company">Company</option>
                      <option value="admin">Administrator</option>
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
