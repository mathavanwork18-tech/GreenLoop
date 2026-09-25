import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import Icon, { type IconName } from '../../../components/Icon'

export const SHOP_NAV_ITEMS: { path: string; icon: IconName; label: string }[] = [
  { path: '/shop',              icon: 'shop',     label: 'Dashboard'       },
  { path: '/shop/inventory',    icon: 'package',  label: 'Inventory'       },
  { path: '/shop/pickups',      icon: 'pickup',   label: 'Pickup Requests' },
  { path: '/shop/transactions', icon: 'coin',     label: 'Transactions'   },
  { path: '/shop/analytics',    icon: 'chart',    label: 'Analytics'      },
  { path: '/shop/notifications',icon: 'bell',     label: 'Notifications'  },
  { path: '/shop/profile',      icon: 'user',     label: 'Business Profile'},
]

export default function LocalShopAppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100dvh', position: 'relative' }}>
      {/* Desktop Sticky Sidebar */}
      <aside
        className="desktop-sidebar hide-mobile"
        aria-label="Local Shop Business Navigation"
        style={{
          width: 250,
          background: '#0D1710',
          borderRight: '1px solid #203526',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 30,
        }}
      >
        {/* Brand & Business Hub Header */}
        <div
          onClick={() => navigate('/shop')}
          style={{
            cursor: 'pointer',
            padding: '18px 20px',
            borderBottom: '1px solid #203526',
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
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
              flexShrink: 0,
            }}
          >
            <Icon name="shop" size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#F5F7F5', lineHeight: 1.2 }}>
              Green Loop
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: '#FB923C',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Shop Hub
            </div>
          </div>
        </div>

        {/* Business Status Pill */}
        <div style={{ padding: '12px 18px 6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(34, 197, 94, 0.10)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 6px #22C55E',
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F5F7F5' }}>
                Status: Active
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#22C55E', fontWeight: 700 }}>Open</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '10px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              color: '#66736A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '6px 10px',
            }}
          >
            Business Operations
          </div>

          {SHOP_NAV_ITEMS.map(item => {
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
                  background: isActive ? 'rgba(249, 115, 22, 0.10)' : 'transparent',
                  color: isActive ? '#F5F7F5' : '#9CA3A5',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  border: isActive ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid transparent',
                }}
              >
                <Icon name={item.icon} size={18} color={isActive ? '#FB923C' : '#66736A'} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Footer info & theme toggle */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #203526', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} color={theme === 'dark' ? '#fbbf24' : '#9CA3A5'} />
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#66736A' }}>Toggle</span>
          </button>

          <div
            onClick={() => navigate('/shop/profile')}
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
                background: 'rgba(249, 115, 22, 0.15)',
                color: '#FB923C',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0] || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#F5F7F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Local Shop'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#66736A' }}>
                {user?.city || 'Coimbatore'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', background: '#07100A' }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation (Exclusive 7-item shop flow or top-level 5) */}
      <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Shop Mobile Navigation" style={{ background: '#0D1710', borderTop: '1px solid #203526' }}>
        {SHOP_NAV_ITEMS.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ background: 'none', border: 'none', width: '100%' }}
            >
              <div className="nav-item-icon">
                <Icon name={item.icon} size={20} color={isActive ? '#FB923C' : '#66736A'} />
              </div>
              <span style={{ color: isActive ? '#FB923C' : '#66736A', fontWeight: isActive ? 800 : 600, fontSize: '0.72rem' }}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
