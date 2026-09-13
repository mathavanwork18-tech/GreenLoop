import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Icon, { type IconName } from '../../components/Icon'

const SHOP_NAV_ITEMS: { path: string; icon: IconName; label: string; isPost?: boolean }[] = [
  { path: '/',       icon: 'home',   label: 'Home' },
  { path: '/map',    icon: 'map',    label: 'Map' },
  { path: '/post',   icon: 'plus',   label: 'Post', isPost: true },
  { path: '/orders', icon: 'orders', label: 'Orders' },
  { path: '/account',icon: 'user',   label: 'Account' },
]

export default function LocalShopAppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isMapPage = location.pathname === '/map'

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100dvh', position: 'relative' }}>
      {/* Desktop Sticky Sidebar */}
      <aside className="desktop-sidebar hide-mobile" aria-label="Local Shop Desktop Navigation">
        {/* Logo & Hub Header */}
        <div
          className="sidebar-logo"
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                flexShrink: 0,
              }}
            >
              <Icon name="shop" size={20} color="#ffffff" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                Green Loop
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#38bdf8',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Shop Hub
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Post Bulk Material */}
        <div style={{ padding: '8px 14px 14px' }}>
          <button
            onClick={() => navigate('/post')}
            className="btn btn-primary btn-full"
            style={{
              gap: 8,
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              border: 'none',
              color: '#ffffff',
            }}
          >
            <Icon name="plus" size={18} color="#ffffff" />
            <span>Post Bulk Material</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            padding: '0 10px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '8px 12px 4px',
            }}
          >
            Shop Management
          </div>

          {SHOP_NAV_ITEMS.filter(i => !i.isPost).map((item) => {
            const isActive = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                }}
              >
                <Icon
                  name={item.icon}
                  size={19}
                  color={isActive ? '#38bdf8' : 'var(--text-tertiary)'}
                />
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Sidebar Bottom Profile & Controls */}
        <div
          style={{
            marginTop: 'auto',
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Quick Switch to General User Button */}
          <button
            onClick={() => setRole('GENERAL_USER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'background var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="user" size={15} color="var(--accent)" />
              <span>Switch to Citizen View</span>
            </div>
            <Icon name="arrow-right" size={14} color="var(--accent)" />
          </button>

          {/* Theme Switcher */}
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
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon
                name={theme === 'dark' ? 'sun' : 'moon'}
                size={16}
                color={theme === 'dark' ? '#fbbf24' : 'var(--text-secondary)'}
              />
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Active</span>
          </button>

          {/* User Shop Badge */}
          <div
            onClick={() => navigate('/account')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0] || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name || 'Local Shop Partner'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  fontWeight: 700,
                }}
              >
                Verified Business Hub
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          height: isMapPage ? '100dvh' : 'auto',
          maxHeight: isMapPage ? '100dvh' : 'none',
          overflow: isMapPage ? 'hidden' : 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Local Shop) */}
      <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Local Shop Mobile Navigation">
        {SHOP_NAV_ITEMS.map((item) => {
          if (item.isPost) {
            return (
              <div
                key={item.path}
                className="nav-item"
                onClick={() => navigate('/post')}
                style={{ position: 'relative' }}
              >
                <div
                  className="nav-post-btn"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)',
                  }}
                  aria-label="Post Bulk E-Waste"
                >
                  <Icon name="plus" size={24} color="#ffffff" />
                </div>
              </div>
            )
          }

          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
              }}
              aria-label={item.label}
            >
              <div className="nav-item-icon">
                <Icon
                  name={item.icon}
                  size={22}
                  color={isActive ? '#38bdf8' : 'var(--text-tertiary)'}
                />
              </div>
              <span
                style={{
                  color: isActive ? '#38bdf8' : 'var(--text-tertiary)',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
