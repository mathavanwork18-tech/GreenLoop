import { useState } from 'react'
import Icon from '../../../components/Icon'
import type { Role } from '../../../context/AuthContext'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface Props {
  language: LanguageCode
  selectedRole: Role
  onSelectRole: (role: Role) => void
  onContinue: () => void
  onBack: () => void
}

export default function AccountTypeStep({
  language,
  selectedRole,
  onSelectRole,
  onContinue,
  onBack,
}: Props) {
  const t = getAuthTranslation(language)
  const [role, setRole] = useState<Role>(selectedRole || 'GENERAL_USER')

  const handleSelect = (r: Role) => {
    setRole(r)
    onSelectRole(r)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        padding: '24px 20px',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="arrow-left" size={18} color="var(--accent)" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.selectAccountType}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.selectRoleSubtitle}
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Citizen Card */}
        <div
          onClick={() => handleSelect('GENERAL_USER')}
          style={{
            position: 'relative',
            padding: '22px 20px',
            borderRadius: '18px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: role === 'GENERAL_USER' ? '2px solid #10b981' : '1.5px solid var(--border-color)',
            background: role === 'GENERAL_USER'
              ? 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(16,185,129,0.2) 100%)'
              : 'var(--bg-surface)',
            boxShadow: role === 'GENERAL_USER'
              ? '0 0 24px rgba(16,185,129,0.28), 0 8px 24px rgba(0,0,0,0.25)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            transform: role === 'GENERAL_USER' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: role === 'GENERAL_USER' ? '#10b981' : 'rgba(16,185,129,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="user" size={24} color={role === 'GENERAL_USER' ? '#0d1f17' : '#10b981'} />
            </div>

            {/* Selection Check Circle */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: role === 'GENERAL_USER' ? '2px solid #10b981' : '2px solid var(--border-color)',
                background: role === 'GENERAL_USER' ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}
            >
              {role === 'GENERAL_USER' && <Icon name="check" size={14} color="#0d1f17" />}
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            {t.citizenTitle}
          </h3>
          <p style={{ fontSize: '0.88rem', color: role === 'GENERAL_USER' ? 'var(--accent-text)' : 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
            {t.citizenDesc}
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['📱 Recycle Devices', '🪙 Earn Green Coins', '🌱 Track CO2 Offset'].map((badge, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Local Shop Card */}
        <div
          onClick={() => handleSelect('LOCAL_SHOP')}
          style={{
            position: 'relative',
            padding: '22px 20px',
            borderRadius: '18px',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: role === 'LOCAL_SHOP' ? '2px solid #10b981' : '1.5px solid var(--border-color)',
            background: role === 'LOCAL_SHOP'
              ? 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(16,185,129,0.2) 100%)'
              : 'var(--bg-surface)',
            boxShadow: role === 'LOCAL_SHOP'
              ? '0 0 24px rgba(16,185,129,0.28), 0 8px 24px rgba(0,0,0,0.25)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            transform: role === 'LOCAL_SHOP' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: role === 'LOCAL_SHOP' ? '#10b981' : 'rgba(16,185,129,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="shop" size={24} color={role === 'LOCAL_SHOP' ? '#0d1f17' : '#10b981'} />
            </div>

            {/* Selection Check Circle */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: role === 'LOCAL_SHOP' ? '2px solid #10b981' : '2px solid var(--border-color)',
                background: role === 'LOCAL_SHOP' ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}
            >
              {role === 'LOCAL_SHOP' && <Icon name="check" size={14} color="#0d1f17" />}
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            {t.shopTitle}
          </h3>
          <p style={{ fontSize: '0.88rem', color: role === 'LOCAL_SHOP' ? 'var(--accent-text)' : 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
            {t.shopDesc}
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['🔧 Repair Services', '📦 E-Waste Collection', '💼 Grow Customer Base'].map((badge, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div style={{ paddingTop: 24, marginTop: 'auto' }}>
        <button
          type="button"
          onClick={onContinue}
          className="btn btn-primary btn-lg btn-full"
          style={{
            height: 52,
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(16,185,129,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span>{t.continueBtn}</span>
          <Icon name="arrow-right" size={18} color="#fff" />
        </button>
      </div>
    </div>
  )
}
