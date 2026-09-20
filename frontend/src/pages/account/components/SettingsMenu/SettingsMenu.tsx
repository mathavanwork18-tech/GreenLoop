import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../../../context/ThemeContext'
import { usePwaInstall } from '../../../../context/PwaInstallContext'
import Icon from '../../../../components/Icon'
import NotificationPermissionCard from '../../../../components/notifications/NotificationPermissionCard'

interface SettingsMenuProps {
  onOpenHelp: () => void
  onLogout: () => void
}

export default function SettingsMenu({ onOpenHelp, onLogout }: SettingsMenuProps) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { isInstalled, openInstallModal } = usePwaInstall()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="section-header">
        <span className="section-title">Account & Preferences</span>
      </div>

      {/* Edit Profile Entry */}
      <div
        onClick={() => navigate('/account/edit')}
        className="card"
        style={{
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: '1.5px solid var(--accent)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="settings" size={18} color="var(--accent)" />
          <div>
            <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
              Edit Profile & Security
            </strong>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Photo, personal details, privacy, active sessions
            </div>
          </div>
        </div>
        <Icon name="arrow-right" size={14} color="var(--accent)" />
      </div>

      {/* Theme Switcher */}
      <div
        onClick={toggleTheme}
        className="card"
        style={{
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} color={theme === 'dark' ? '#fbbf24' : 'var(--text-secondary)'} />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            App Appearance / Dark Mode
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      {/* System & Device Notifications Status & Controls */}
      <NotificationPermissionCard compact />

      {/* PWA Install Entry in Settings */}
      <div
        onClick={openInstallModal}
        className="card"
        style={{
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isInstalled ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
          border: isInstalled ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name={isInstalled ? 'check' : 'download'} size={18} color="var(--accent)" />
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isInstalled ? 'Green Loop Installed' : 'Install Green Loop'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {isInstalled
                ? 'Running as standalone progressive web app'
                : 'Faster access with supported offline features and app icon'}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {isInstalled ? 'Installed' : 'Install'}
        </span>
      </div>

      {/* Help & Support */}
      <div
        onClick={onOpenHelp}
        className="card"
        style={{
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="help" size={18} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Help, Grievances & TNPCB Helpline
          </span>
        </div>
        <Icon name="arrow-right" size={14} color="var(--text-tertiary)" />
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="btn btn-ghost btn-full"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#ef4444',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.3)',
          marginTop: 12,
          padding: '11px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.84rem',
          fontWeight: 700
        }}
      >
        <Icon name="logout" size={16} color="#ef4444" />
        <span>Log Out from Green Loop</span>
      </button>
    </div>
  )
}
