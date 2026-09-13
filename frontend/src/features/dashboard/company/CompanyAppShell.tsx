import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import Icon, { type IconName } from '../../../components/Icon'

export const COMPANY_NAV_ITEMS: { path: string; icon: IconName; label: string }[] = [
  { path: '/company',              icon: 'chart',    label: 'Dashboard'           },
  { path: '/company/requests',     icon: 'pickup',   label: 'Collection Requests' },
  { path: '/company/inventory',    icon: 'package',  label: 'Inventory'           },
  { path: '/company/processing',   icon: 'refresh',  label: 'Processing'          },
  { path: '/company/transactions', icon: 'coin',     label: 'Transactions'       },
  { path: '/company/analytics',    icon: 'target',   label: 'Analytics'          },
  { path: '/company/reports',      icon: 'shield',   label: 'Reports'             },
  { path: '/company/notifications',icon: 'bell',     label: 'Notifications'      },
  { path: '/company/profile',      icon: 'building', label: 'Company Profile'     },
]

export default function CompanyAppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100dvh', position: 'relative' }}>
      {/* Desktop Sticky Sidebar */}
      <aside
        className="desktop-sidebar hide-mobile"
        aria-label="Enterprise Navigation"
        style={{
          width: 260,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 30,
        }}
      >
        {/* Brand & Enterprise Hub Header */}
        <div
          onClick={() => navigate('/company')}
          style={{
            cursor: 'pointer',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #059669, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              flexShrink: 0,
            }}
          >
            <Icon name="building" size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Green Loop
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#10b981',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Enterprise Recycler
            </div>
          </div>
        </div>

        {/* Enterprise Compliance Status Badge */}
        <div style={{ padding: '12px 18px 6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                TNPCB Authorized
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 800 }}>Certified</span>
          </div>
        </div>

        {/* Navigation Items (9 items) */}
        <nav style={{ padding: '10px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '6px 10px',
            }}
          >
            Enterprise Operations
          </div>

          {COMPANY_NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(5, 150, 105, 0.12)' : 'transparent',
                  color: isActive ? '#059669' : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid transparent',
                }}
              >
                <Icon name={item.icon} size={17} color={isActive ? '#059669' : 'var(--text-tertiary)'} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Footer info & theme toggle */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} color={theme === 'dark' ? '#fbbf24' : 'var(--text-secondary)'} />
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Toggle</span>
          </button>

          <div
            onClick={() => navigate('/company/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 8px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.15)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0] || 'C'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Company Operations'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                {user?.city || 'Coimbatore'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation (Exclusive 5 top enterprise items) */}
      <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Company Mobile Navigation">
        {COMPANY_NAV_ITEMS.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ background: 'none', border: 'none', width: '100%' }}
            >
              <div className="nav-item-icon">
                <Icon name={item.icon} size={20} color={isActive ? '#059669' : 'var(--text-tertiary)'} />
              </div>
              <span style={{ color: isActive ? '#059669' : 'var(--text-tertiary)', fontWeight: isActive ? 800 : 600, fontSize: '0.72rem' }}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
