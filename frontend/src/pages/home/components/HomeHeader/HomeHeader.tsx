import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useTheme } from '../../../../context/ThemeContext'
import { usePwaInstall } from '../../../../context/PwaInstallContext'
import Icon from '../../../../components/Icon'
import GreenCoinBadge from '../../../../components/eco/GreenCoinBadge'
import InstallButton from '../../../../components/InstallButton'
import LanguageSwitcherModal from '../../../../components/LanguageSwitcherModal'
import { useTranslation } from '../../../../i18n/useTranslation'

interface HomeHeaderProps {
  onNotificationClick: () => void
}

export default function HomeHeader({ onNotificationClick }: HomeHeaderProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { openInstallModal } = usePwaInstall()
  const { currentLang, t } = useTranslation()
  const [showLangModal, setShowLangModal] = useState(false)

  return (
    <header className="header" style={{ position: 'sticky', top: 0, zIndex: 30 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Branding & City */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.png"
            alt="Green Loop Logo"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              padding: 2,
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Green Loop
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon name="location-pin" size={10} color="var(--accent)" />
              <span>{user?.area || 'RS Puram'}, {user?.city || 'Coimbatore'}</span>
            </div>
          </div>
        </div>

        {/* Right: Green Coins, Theme Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GreenCoinBadge coins={user?.greenCoins} onClick={() => navigate('/activity')} />

          {/* Language Switcher Button */}
          <button
            onClick={() => setShowLangModal(true)}
            aria-label={t('common.language')}
            title={t('common.language')}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 999,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '0.74rem',
              fontWeight: 800
            }}
          >
            <Icon name="globe" size={14} color="var(--accent)" />
            <span>{currentLang.toUpperCase()}</span>
          </button>

          {/* Install Web App Button */}
          <InstallButton onFallback={openInstallModal} />

          {/* Transparent Dark / Light Mode Toggle Button with Flaticon Icons */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              padding: 0
            }}
          >
            <Icon
              name={theme === 'dark' ? 'sun' : 'moon'}
              size={20}
              color={theme === 'dark' ? '#fbbf24' : 'var(--text-primary)'}
            />
          </button>

          {/* Direct Messages Shortcut */}
          <button
            onClick={() => navigate('/chat')}
            aria-label="Messages & Chat"
            title="Messages & Chat"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--text-primary)'
            }}
          >
            <Icon name="comment" size={17} color="var(--text-primary)" />
          </button>

          <button
            onClick={onNotificationClick}
            aria-label="Notifications"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Icon name="bell" size={17} color="var(--text-primary)" />
            <span
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444'
              }}
            />
          </button>
        </div>
      </div>

      <LanguageSwitcherModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </header>
  )
}
