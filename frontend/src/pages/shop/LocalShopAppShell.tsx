import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Icon, { type IconName } from '../../components/Icon'
import ProfileCompletionBanner from '../../components/profile/ProfileCompletionBanner'

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
  const isMapPage = location.pathname === '/map' || location.pathname === '/shop/map'

  return (
    <div
      className="gl-shop-wrapper"
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100dvh',
        position: 'relative',
        backgroundColor: '#07100A',
        color: '#F5F7F5',
      }}
    >
      {/* Desktop Sticky Sidebar */}
      <aside
        className="desktop-sidebar gl-shop-sidebar hide-mobile"
        aria-label="Local Shop Desktop Navigation"
        style={{
          width: 240,
          minWidth: 240,
          maxWidth: 240,
          height: '100dvh',
          position: 'sticky',
          top: 0,
          backgroundColor: '#0D1710',
          borderRight: '1px solid #203526',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          zIndex: 50,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Logo & Hub Header */}
        <div
          className="sidebar-logo"
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            padding: '4px 18px 16px',
            borderBottom: '1px solid #203526',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(249, 115, 22, 0.12)',
                border: '1px solid rgba(249, 115, 22, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
                flexShrink: 0,
              }}
            >
              <Icon name="shop" size={20} color="#FB923C" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: '#F5F7F5',
                  lineHeight: 1.2,
                }}
              >
                Green Loop
              </div>
              <div
                style={{
                  fontSize: '0.70rem',
                  color: '#FB923C',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Shop Hub
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Post Bulk Material (E-Waste Orange) */}
        <div style={{ padding: '8px 14px 12px' }}>
          <button
            onClick={() => navigate('/post')}
            className="gl-shop-btn-post"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: '#F97316',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.28)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="plus" size={18} color="#FFFFFF" />
            <span>Post Bulk Material</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '0 10px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#66736A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '6px 12px 2px',
            }}
          >
            Shop Management
          </div>

          {SHOP_NAV_ITEMS.filter((i) => !i.isPost).map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`gl-shop-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(249, 115, 22, 0.10)' : 'transparent',
                  color: isActive ? '#F5F7F5' : '#9CA3A5',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: isActive ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid transparent',
                }}
              >
                <div className="gl-shop-icon" style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon
                    name={item.icon}
                    size={19}
                    color={isActive ? '#FB923C' : '#66736A'}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Sidebar Bottom Profile & Controls */}
        <div
          style={{
            marginTop: 'auto',
            padding: '12px 14px',
            borderTop: '1px solid #203526',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Quick Switch to General User Button (Eco Green) */}
          <button
            onClick={() => setRole('GENERAL_USER')}
            className="gl-shop-btn-citizen-switch"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1.5px solid #22C55E',
              color: '#22C55E',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="user" size={15} color="#22C55E" />
              <span>Switch to Citizen View</span>
            </div>
            <Icon name="arrow-right" size={14} color="#22C55E" />
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
              background: '#111F14',
              border: '1px solid #203526',
              color: '#9CA3A5',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon
                name={theme === 'dark' ? 'sun' : 'moon'}
                size={16}
                color={theme === 'dark' ? '#F59E0B' : '#9CA3A5'}
              />
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span style={{ fontSize: '0.70rem', color: '#66736A' }}>Active</span>
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
              background: '#111F14',
              border: '1px solid #203526',
              transition: 'border-color 0.18s ease',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0] || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  color: '#F5F7F5',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name || 'Local Shop Partner'}
              </div>
              <div
                style={{
                  fontSize: '0.70rem',
                  color: '#22C55E',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
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
          backgroundColor: '#07100A',
        }}
      >
        <ProfileCompletionBanner />
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Local Shop Hub: Orange + Green Identity) */}
      <nav
        className="bottom-nav gl-shop-bottom-nav hide-desktop"
        role="navigation"
        aria-label="Local Shop Mobile Navigation"
        style={{
          backgroundColor: '#0D1710',
          borderTop: '1px solid #203526',
        }}
      >
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
                    background: '#F97316',
                    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.45)',
                  }}
                  aria-label="Post Bulk E-Waste"
                >
                  <Icon name="plus" size={24} color="#ffffff" />
                </div>
              </div>
            )
          }

          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
              aria-label={item.label}
            >
              <div className="nav-item-icon">
                <Icon
                  name={item.icon}
                  size={22}
                  color={isActive ? '#FB923C' : '#66736A'}
                />
              </div>
              <span
                style={{
                  color: isActive ? '#FB923C' : '#9CA3A5',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.72rem',
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
