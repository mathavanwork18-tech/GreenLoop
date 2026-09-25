import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import HelpSupportModal from '../account/components/Modals/HelpSupportModal'

export default function LocalShopAccountPage() {
  const navigate = useNavigate()
  const { user, logout, setRole } = useAuth()
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Hover states for settings rows
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('[Green Loop Shop] Logout failed:', err)
      setIsLoggingOut(false)
    }
  }

  const shopName = user?.roleProfile?.shopName || user?.name || 'Authorized Repair Hub'
  const ownerName = user?.roleProfile?.ownerName || user?.name || 'Business Owner'
  const phone = user?.phone || 'Not registered'
  const address = user?.roleProfile?.shopAddress || user?.area || user?.city || 'RS Puram, Coimbatore'
  const city = user?.city || 'Coimbatore'

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 36px)',
        width: '100%',
        backgroundColor: '#07100A',
        minHeight: '100dvh',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#07100A',
          borderBottom: '1px solid #203526',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: 0,
            color: '#F5F7F5',
            letterSpacing: '-0.02em',
          }}
        >
          Business Account & Profile
        </h1>
        <div style={{ fontSize: '0.76rem', color: '#9CA3A5', marginTop: 2 }}>
          Manage your verified shop credentials, contact details, and account preferences
        </div>
      </header>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Business Profile Card (E-Waste + Eco Business Theme) */}
        <div
          className="gl-shop-card"
          style={{
            background: '#0D1710',
            border: '1px solid #203526',
            borderRadius: 'var(--radius-lg)',
            padding: 22,
            marginBottom: 18,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#111F14',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                border: '2px solid rgba(34, 197, 94, 0.35)',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                flexShrink: 0,
              }}
            >
              {shopName[0] || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#F5F7F5',
                    margin: 0,
                  }}
                >
                  {shopName}
                </h2>
                {/* Verified Shop Badge (Green Trust) */}
                <span
                  className="gl-shop-badge-verified"
                  style={{
                    background: 'rgba(34, 197, 94, 0.10)',
                    color: '#22C55E',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon name="verified" size={12} color="#22C55E" />
                  <span>Verified Shop</span>
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#9CA3A5', marginTop: 4 }}>
                Proprietor: <strong style={{ color: '#F5F7F5' }}>{ownerName}</strong>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              background: '#111F14',
              border: '1px solid #203526',
              padding: 14,
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.80rem',
                color: '#22C55E',
                fontWeight: 600,
              }}
            >
              <Icon name="phone" size={15} color="#22C55E" />
              <span>{phone}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.80rem',
                color: '#38BDF8',
                fontWeight: 600,
              }}
            >
              <Icon name="location-pin" size={15} color="#38BDF8" />
              <span>{address}, {city}</span>
            </div>
          </div>
        </div>

        {/* ROLE SWITCH CARD (Switch back to General User: Eco Green) */}
        <div
          className="gl-shop-card"
          style={{
            background: '#0D1710',
            border: '1px solid #203526',
            borderRadius: 'var(--radius-lg)',
            padding: 18,
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#22C55E',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Account Mode
            </div>
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: '#F5F7F5',
                marginTop: 2,
              }}
            >
              Currently in Local Shop / Company Mode
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3A5', marginTop: 2 }}>
              Want to post single items or participate as an individual citizen?
            </div>
          </div>
          <button
            onClick={() => setRole('GENERAL_USER')}
            className="gl-shop-btn-citizen-switch"
            style={{
              padding: '8px 16px',
              fontSize: '0.80rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #22C55E',
              color: '#22C55E',
              background: 'rgba(34, 197, 94, 0.08)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="user" size={16} color="#22C55E" />
            <span>Switch to Citizen</span>
          </button>
        </div>

        {/* Account Settings Options */}
        <div
          className="gl-shop-card"
          style={{
            background: '#0D1710',
            border: '1px solid #203526',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Edit Profile */}
          <div
            onClick={() => navigate('/account/edit')}
            onMouseEnter={() => setHoveredRow('edit')}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid #203526',
              background: hoveredRow === 'edit' ? 'rgba(249, 115, 22, 0.06)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: '#111F14',
                  border: '1px solid #203526',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="edit" size={16} color="#FB923C" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F5F7F5' }}>Edit Profile</div>
                <div style={{ fontSize: '0.74rem', color: '#9CA3A5' }}>
                  Update business name, phone, or shop address in Supabase
                </div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="#66736A" />
          </div>

          {/* Notifications */}
          <div
            onClick={() => navigate('/notifications')}
            onMouseEnter={() => setHoveredRow('bell')}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid #203526',
              background: hoveredRow === 'bell' ? 'rgba(249, 115, 22, 0.06)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: '#111F14',
                  border: '1px solid #203526',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name="bell"
                  size={16}
                  color={hoveredRow === 'bell' ? '#FB923C' : '#9CA3A5'}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F5F7F5' }}>Notifications</div>
                <div style={{ fontSize: '0.74rem', color: '#9CA3A5' }}>
                  Buyer enquiries, claim updates, and dispatch alerts
                </div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="#66736A" />
          </div>

          {/* Help & Support */}
          <div
            onClick={() => setShowHelpModal(true)}
            onMouseEnter={() => setHoveredRow('help')}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: hoveredRow === 'help' ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: '#111F14',
                  border: '1px solid #203526',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name="help"
                  size={16}
                  color={hoveredRow === 'help' ? '#22C55E' : '#9CA3A5'}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F5F7F5' }}>Help & Support Desk</div>
                <div style={{ fontSize: '0.74rem', color: '#9CA3A5' }}>
                  TNPCB regulatory guidance, disposal standards & contact hotline
                </div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="#66736A" />
          </div>
        </div>

        {/* Account & Security: Official Logout (Keep Red) */}
        <div
          className="gl-shop-card"
          style={{
            background: '#0D1710',
            border: '1px solid #203526',
            borderRadius: 'var(--radius-lg)',
            padding: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F5F7F5', marginBottom: 6 }}>
            Account & Security
          </div>
          <p style={{ fontSize: '0.78rem', color: '#9CA3A5', margin: '0 0 14px' }}>
            Signing out terminates your authenticated Supabase session on this device.
          </p>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gl-shop-btn-logout"
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="logout" size={16} color="#EF4444" />
            <span>{isLoggingOut ? 'Signing Out...' : 'Log Out of Shop Hub'}</span>
          </button>
        </div>
      </div>

      {showHelpModal && <HelpSupportModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />}
    </div>
  )
}
