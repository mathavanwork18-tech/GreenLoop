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
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 36px)', width: '100%' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Business Account & Profile
        </h1>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          Manage your verified shop credentials, contact details, and account preferences
        </div>
      </header>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Simple Normal Profile Identity Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 18, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                border: '2px solid rgba(37, 99, 235, 0.3)',
                flexShrink: 0,
              }}
            >
              {shopName[0] || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {shopName}
                </h2>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon name="verified" size={12} color="var(--accent)" />
                  <span>Verified Shop</span>
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Proprietor: <strong style={{ color: 'var(--text-primary)' }}>{ownerName}</strong>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, background: 'var(--bg-surface-2)', padding: 14, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Icon name="phone" size={15} color="var(--accent)" />
              <span>{phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Icon name="location-pin" size={15} color="#2563eb" />
              <span>{address}, {city}</span>
            </div>
          </div>
        </div>

        {/* ROLE SWITCH CARD (Switch back to General User) */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Mode
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Currently in Local Shop / Company Mode
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Want to post single items or participate as an individual citizen?
            </div>
          </div>
          <button
            onClick={() => setRole('GENERAL_USER')}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--accent)',
              color: 'var(--accent)',
              background: 'rgba(16, 185, 129, 0.08)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon name="user" size={16} color="var(--accent)" />
            <span>Switch to Citizen</span>
          </button>
        </div>

        {/* Normal Account Settings Options */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          {/* Edit Profile */}
          <div
            onClick={() => navigate('/account/edit')}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="edit" size={16} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Update business name, phone, or shop address in Supabase</div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
          </div>

          {/* Notifications */}
          <div
            onClick={() => navigate('/notifications')}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bell" size={16} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Buyer enquiries, claim updates, and dispatch alerts</div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
          </div>

          {/* Help & Support */}
          <div
            onClick={() => setShowHelpModal(true)}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="help" size={16} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Help & Support Desk</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>TNPCB regulatory guidance, disposal standards & contact hotline</div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} color="var(--text-tertiary)" />
          </div>
        </div>

        {/* Account & Security: Official Logout */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Account & Security
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
            Signing out terminates your authenticated Supabase session on this device.
          </p>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="logout" size={16} color="#ef4444" />
            <span>{isLoggingOut ? 'Signing Out...' : 'Log Out of Shop Hub'}</span>
          </button>
        </div>
      </div>

      {showHelpModal && <HelpSupportModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />}
    </div>
  )
}
