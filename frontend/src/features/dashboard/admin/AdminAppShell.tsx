import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Icon, { type IconName } from '../../../components/Icon'

interface AdminNavItem {
  path: string
  label: string
  icon: IconName
  badge?: string
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin',                  label: 'Overview',            icon: 'home' },
  { path: '/admin/users',            label: 'Users',               icon: 'user' },
  { path: '/admin/shops',            label: 'Local Shops',         icon: 'shop' },
  { path: '/admin/companies',        label: 'Companies',           icon: 'building' },
  { path: '/admin/posts',            label: 'Posts & Moderation',  icon: 'package' },
  { path: '/admin/pickups',          label: 'Pickup Requests',     icon: 'truck' },
  { path: '/admin/centers',          label: 'Recycling Centers',   icon: 'recycle' },
  { path: '/admin/reports',          label: 'Reports & Flagged',   icon: 'shield' },
  { path: '/admin/notifications',    label: 'Broadcast Alerts',    icon: 'bell' },
  { path: '/admin/recommendations',  label: 'AI Recommendations',  icon: 'sparkles' },
  { path: '/admin/health',           label: 'Database Health',     icon: 'activity' },
  { path: '/admin/analytics',        label: 'Analytics',           icon: 'trending-up' },
  { path: '/admin/audit-logs',       label: 'Audit Logs',          icon: 'file-text' },
  { path: '/admin/settings',         label: 'Settings',            icon: 'settings' },
]

export default function AdminAppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: '#0a100d',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Admin Sidebar */}
      <aside
        style={{
          width: 260,
          backgroundColor: '#0f1713',
          borderRight: '1px solid rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 40,
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Icon name="shield" size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Green Loop Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
              Control Center
            </div>
          </div>
        </div>

        {/* Admin User Card */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          >
            {(user?.name || 'Admin').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Authorized Admin'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Creator / Root Admin
            </div>
          </div>
        </div>

        {/* 14 Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}`,
                  color: isActive ? '#34d399' : '#94a3b8',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={item.icon} size={16} color={isActive ? '#34d399' : '#64748b'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: 999,
                      background: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer System Status & Logout */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#64748b' }}>Supabase DB</span>
            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Connected
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Icon name="logout" size={14} color="#f87171" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 56,
            backgroundColor: '#0f1713',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
              Portal:
            </span>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 10px',
                borderRadius: 999,
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              TNPCB & Supabase Production Authority
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Authorized Creators: <strong>Mathavan • Vimal Raj • Thiru Loop</strong>
            </span>
          </div>
        </header>

        {/* Child Views */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
