import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { userService } from '../../../services/userService'
import { ROLES } from '../../../constants/roles'
import type { Role } from '../../../types/auth.types'
import Icon from '../../../components/Icon'

export default function CompanyProfile() {
  const navigate = useNavigate()
  const { user, logout, setRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [companyName, setCompanyName] = useState(user?.name || 'Green Loop Enterprise Recyclers')
  const [phone, setPhone] = useState(user?.phone || '')
  const [city, setCity] = useState(user?.city || 'Coimbatore')
  const [address, setAddress] = useState(user?.area || 'SIDCO Industrial Estate, Kurichi, Coimbatore')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      await userService.updateUserProfile(user.id, {
        full_name: companyName,
        phone,
        city,
        address,
      })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(`Failed to update company profile: ${err?.message || 'Database error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = (targetRole: Role) => {
    setRole(targetRole)
    if (targetRole === 'citizen') {
      navigate('/')
    } else if (targetRole === 'shop') {
      navigate('/shop')
    } else {
      navigate('/company')
    }
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
          Enterprise Company Profile
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Manage your certified smelting and recycling facility credentials, compliance records, and active role
        </p>
      </div>

      {saveSuccess && (
        <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderRadius: 'var(--radius-md)', marginBottom: 16, fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="check" size={14} color="#10b981" />
          <span>Enterprise profile updated and synced with Supabase public.profiles!</span>
        </div>
      )}

      {/* Role Switcher Section */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="refresh" size={16} color="#059669" />
          <span>Switch Application Role / Dashboard</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0 0 14px' }}>
          Instantly toggle between General User, Local Shop, and Enterprise Company dashboards:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {ROLES.map(r => {
            const isCurrent = user?.role === 'company' && r.id === 'company'
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '2px solid #059669' : '1px solid var(--border-color)',
                  background: isCurrent ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-surface-2)',
                  color: isCurrent ? '#059669' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{r.label}</span>
                <span style={{ fontSize: '0.68rem', color: isCurrent ? '#059669' : 'var(--text-tertiary)', fontWeight: 600 }}>
                  {r.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Facility Details Card */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Industrial Facility Credentials
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Edit Details
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Company / Facility Entity
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Dispatch Contact Line
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Operating City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Industrial Complex Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', background: '#059669', border: 'none' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Registered Entity</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{companyName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>TNPCB Authorization ID</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>TNPCB/E-WASTE/CBE/2026/0412</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Dispatch Contact</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>{phone || 'Verified Corporate Hotline'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Facility Location</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>{address}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Regulatory Standing</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>● Certified Tier-1 Industrial Recycler</span>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="btn btn-ghost"
        style={{ width: '100%', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', padding: 12, borderRadius: 'var(--radius-md)', fontWeight: 800 }}
      >
        Sign Out of Green Loop
      </button>
    </div>
  )
}
