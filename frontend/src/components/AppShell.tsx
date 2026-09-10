import type { ReactNode } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { usePwaInstall } from '../context/PwaInstallContext'
import GreenAiDrawer from './GreenAiDrawer'
import Icon, { type IconName } from './Icon'
import InstallButton from './InstallButton'

const PRIMARY_NAV_ITEMS: { path: string; icon: IconName; label: string; isPost?: boolean }[] = [
  { path: '/',         icon: 'home',     label: 'Home'     },
  { path: '/map',      icon: 'map',      label: 'Map'      },
  { path: '/post',     icon: 'plus',     label: 'Post',  isPost: true },
  { path: '/activity', icon: 'activity', label: 'Activity' },
  { path: '/account',  icon: 'user',     label: 'Account'  },
]

const DESKTOP_EXTRA_NAV: { path: string; icon: IconName; label: string }[] = [
  { path: '/impact',        icon: 'tree',     label: 'Impact Stats' },
  { path: '/chat',          icon: 'comment',  label: 'Collector Chat' },
  { path: '/notifications', icon: 'bell',     label: 'Notifications' },
  { path: '/support',       icon: 'help',     label: 'Support Desk' },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { isInstalled, openInstallModal } = usePwaInstall()
  const [showAi, setShowAi] = useState(false)
  const isMapPage = location.pathname === '/map'

  return (
    <>
      <div style={{ display: 'flex', width: '100%', minHeight: '100dvh', position: 'relative' }}>
        {/* Desktop Sticky Sidebar (Hidden on Mobile) */}
        <aside className="desktop-sidebar hide-mobile" aria-label="Desktop Navigation">
          {/* Logo & Platform Name */}
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
                  background: 'linear-gradient(135deg, var(--accent), var(--color-primary-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-accent)',
                  flexShrink: 0,
                }}
              >
                <Icon name="recycle" size={22} color="#ffffff" />
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
                    color: 'var(--accent-text)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Circular E-Waste
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Primary Action: Post E-Waste */}
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
                boxShadow: 'var(--shadow-accent)',
              }}
            >
              <Icon name="plus" size={18} color="#ffffff" />
              <span>Post E-Waste</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
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
              Main Menu
            </div>

            {PRIMARY_NAV_ITEMS.filter((item) => !item.isPost).map((item) => {
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
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={19}
                    color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'}
                  />
                  <span>{item.label}</span>
                </div>
              )
            })}

            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '14px 12px 4px',
              }}
            >
              Ecosystem
            </div>

            {DESKTOP_EXTRA_NAV.map((item) => {
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
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'}
                  />
                  <span>{item.label}</span>
                </div>
              )
            })}

            {/* AI Assistant Quick Trigger */}
            <div
              onClick={() => setShowAi(true)}
              style={{
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(16,185,129,0.12) 100%)',
                color: 'var(--accent-text)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: '1px solid rgba(16,185,129,0.25)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon name="sparkles" size={18} color="var(--accent)" />
              <span>Ask Green AI</span>
            </div>
          </nav>

          {/* Sidebar Bottom Profile & Appearance Controls */}
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
            {/* Install App CTA in Sidebar (Desktop) */}
            {isInstalled ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-text)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <Icon name="check" size={14} color="var(--accent)" />
                <span>Green Loop Installed</span>
              </div>
            ) : (
              <InstallButton
                onFallback={openInstallModal}
                style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
                label="Install Green Loop"
              />
            )}

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
                transition: 'background var(--transition-fast)',
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                {theme === 'dark' ? 'Active' : 'Active'}
              </span>
            </button>

            {/* User Profile Snippet */}
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
                transition: 'background var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(16,185,129,0.3)',
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0] || 'M'}
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
                  {user?.name || 'Green Citizen'}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--coin-color)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon name="coin" size={12} color="var(--coin-color)" />
                  <span>{user?.greenCoins?.toLocaleString() || '1,250'} EcoCoins</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Application Canvas */}
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

        {/* Mobile Floating AI Assistant Button */}
        {location.pathname !== '/post' && location.pathname !== '/map' && (
          <button
            onClick={() => setShowAi(true)}
            style={{
              position: 'fixed',
              bottom: 'calc(var(--nav-height) + 16px)',
              right: 18,
              zIndex: 45,
              background: 'linear-gradient(135deg, var(--accent), #047857)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
            }}
            className="hide-desktop"
            aria-label="Open Green AI Assistant"
          >
            <Icon name="sparkles" size={17} color="#ffffff" />
            <span>Ask AI</span>
          </button>
        )}

        {/* Mobile Modern Bottom Navigation Bar */}
        <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Mobile Navigation">
          {PRIMARY_NAV_ITEMS.map((item) => {
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
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                    }}
                    aria-label="Post E-Waste"
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
                    color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'}
                  />
                </div>
                <span
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
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

      {/* Green AI Drawer Modal */}
      <GreenAiDrawer isOpen={showAi} onClose={() => setShowAi(false)} />
    </>
  )
}
