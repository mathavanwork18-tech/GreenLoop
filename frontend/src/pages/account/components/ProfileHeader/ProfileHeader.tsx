import { useNavigate } from 'react-router-dom'
import type { User } from '../../../../types/user.types'
import Icon from '../../../../components/Icon'

interface ProfileHeaderProps {
  user: User | null
  progressPercent: number
  currentLevelObj: { name: string; min: number; max: number; icon: any }
}

export default function ProfileHeader({ user, progressPercent, currentLevelObj }: ProfileHeaderProps) {
  const navigate = useNavigate()
  const currentRole = user?.role || 'GENERAL_USER'

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-2))',
        borderBottom: '1px solid var(--border-color)',
        padding: '20px 0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #047857)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
                boxShadow: 'var(--shadow-md)',
                border: '2px solid #fff',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.[0] || 'M'
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}
                >
                  {user?.name}
                </h2>
                <Icon name="verified" size={14} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon name="location-pin" size={11} color="var(--text-tertiary)" />
                <span>{user?.area}, {user?.city} •</span>
                <Icon name="star" size={11} color="#f59e0b" />
                <span>{user?.rating}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <span
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent-text)',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent)',
                whiteSpace: 'nowrap'
              }}
            >
              {currentRole.replace('_', ' ')}
            </span>

            {/* Prominent Edit Profile button */}
            <button
              onClick={() => navigate('/account/edit')}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--accent)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Icon name="settings" size={12} color="var(--accent)" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name={currentLevelObj.icon} size={14} color="var(--accent)" />
              <span>{currentLevelObj.name}</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {user?.greenCoins} / {currentLevelObj.max === Infinity ? '5,000+' : currentLevelObj.max} Coins
            </span>
          </div>

          <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent), #34d399)',
                borderRadius: 10
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
