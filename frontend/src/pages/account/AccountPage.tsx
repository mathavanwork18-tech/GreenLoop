import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LEVELS } from '../../constants/levels'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import RoleSwitcher from './components/ProfileHeader/RoleSwitcher'
import RewardsStore from './components/RewardsStore/RewardsStore'
import LeaderboardSection from './components/Leaderboard/LeaderboardSection'
import SettingsMenu from './components/SettingsMenu/SettingsMenu'
import HelpSupportModal from './components/Modals/HelpSupportModal'
import Icon from '../../components/Icon'
import type { Role } from '../../types/auth.types'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, logout, setRole, updateCoins } = useAuth()

  const [activeTab, setActiveTab] = useState<'profile' | 'rewards' | 'leaderboard' | 'settings'>('profile')
  const [showHelpModal, setShowHelpModal] = useState(false)

  const currentRole = user?.role || 'GENERAL_USER'

  const handleRedeemReward = (title: string, cost: number) => {
    if ((user?.greenCoins || 0) < cost) {
      alert('Insufficient Green Coins! Complete more daily missions or recycle devices.')
      return
    }
    updateCoins(-cost)
    alert(`Successfully redeemed "${title}"! Voucher code sent to ${user?.email}.`)
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      await logout()
      // Successfully signed out of Supabase:
      // Navigate to /login with replace: true to prevent Back button re-entry
      navigate('/login', { replace: true })
    } catch (err: any) {
      console.error('[AccountPage] Logout failed:', err)
      setLogoutError(err?.message || 'Unable to log out from Supabase. Please check your network and try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const currentLevelObj =
    LEVELS.find(l => (user?.greenCoins || 0) >= l.min && (user?.greenCoins || 0) <= l.max) || LEVELS[0]
  const progressPercent = Math.min(
    100,
    Math.round((((user?.greenCoins || 0) - currentLevelObj.min) / (currentLevelObj.max - currentLevelObj.min || 1)) * 100)
  )

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)' }}>
      {/* 1. Profile Header with Level Progress */}
      <ProfileHeader
        user={user}
        progressPercent={progressPercent}
        currentLevelObj={currentLevelObj}
      />

      {/* 2. Navigation Tabs */}
      <div className="container" style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16 }}>
          {[
            { id: 'profile', label: 'Overview & Role' },
            { id: 'rewards', label: 'Rewards Store' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'settings', label: 'Settings' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: activeTab === t.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 3. Tab Contents */}
        {activeTab === 'profile' && (
          <div>
            {!user?.isProfileComplete && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <Icon name="sparkles" size={20} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        Complete Your Profile
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        Action Needed
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      Set your account password and location to enable email sign-in and unlock full features.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/account/edit')}
                  className="btn btn-primary btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 800,
                  }}
                >
                  <span>Set Password</span>
                  <Icon name="arrow-right" size={14} color="#ffffff" />
                </button>
              </div>
            )}

            <RoleSwitcher
              currentRole={currentRole as Role}
              onSelectRole={r => setRole(r)}
            />
          </div>
        )}

        {activeTab === 'rewards' && (
          <RewardsStore
            userCoins={user?.greenCoins || 0}
            onRedeem={handleRedeemReward}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardSection />
        )}

        {activeTab === 'settings' && (
          <SettingsMenu
            onOpenHelp={() => setShowHelpModal(true)}
            onLogout={handleLogout}
          />
        )}

        {/* 4. Clearly Separated Account & Security Section near bottom of Account Page */}
        <div
          className="card"
          style={{
            marginTop: 24,
            marginBottom: 16,
            padding: '16px 18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Account & Security
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Session Management
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
            Signed in as <strong>{user?.email || user?.phone || user?.name || 'Green Loop Citizen'}</strong>. Sign out to safely terminate your authenticated Supabase session on this device.
          </p>

          {logoutError && (
            <div
              style={{
                marginBottom: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Icon name="alert" size={16} color="#ef4444" />
              <span>{logoutError}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-ghost btn-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Icon name="logout" size={18} color="#ef4444" />
            <span>{isLoggingOut ? 'Signing out from Supabase...' : 'Log Out from Green Loop'}</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  )
}
