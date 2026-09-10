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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Circular Impact Statistics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-surface-2)', padding: 10, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {user?.transactions || 0}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Eco Actions</div>
                </div>
                <div style={{ background: 'var(--bg-surface-2)', padding: 10, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {((user?.greenCoins || 0) * 0.12).toFixed(1)}kg
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>E-Waste Saved</div>
                </div>
                <div style={{ background: 'var(--bg-surface-2)', padding: 10, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {((user?.greenCoins || 0) * 0.08).toFixed(1)}kg
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CO₂e Offset</div>
                </div>
              </div>
            </div>
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
      </div>

      {/* Help Modal */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  )
}
