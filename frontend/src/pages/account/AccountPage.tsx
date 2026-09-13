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
