import { ROLES } from '../../../../constants/roles'
import type { Role } from '../../../../types/auth.types'
import Icon from '../../../../components/Icon'

interface RoleSwitcherProps {
  currentRole: Role
  onSelectRole: (role: Role) => void
}

export default function RoleSwitcher({ currentRole, onSelectRole }: RoleSwitcherProps) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="refresh" size={15} color="var(--accent)" />
        <span>Switch Account Role / Dashboard</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {ROLES.map(role => {
          const isSelected =
            currentRole === role.id ||
            (currentRole === 'GENERAL_USER' && role.id === 'citizen') ||
            (currentRole === 'LOCAL_SHOP' && role.id === 'shop') ||
            (currentRole === 'COMPANY' && role.id === 'company')
          const isShop = role.id === 'shop'
          const isCompany = role.id === 'company'
          const activeBg = isShop ? '#2563eb' : isCompany ? '#059669' : 'var(--accent)'
          const activeBorder = isShop ? '#1d4ed8' : isCompany ? '#047857' : '#059669'

          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              style={{
                background: isSelected ? activeBg : 'var(--bg-surface-2)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                border: isSelected ? `2px solid ${activeBorder}` : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon
                name={isShop ? 'shop' : isCompany ? 'building' : 'user'}
                size={16}
                color={isSelected ? '#ffffff' : isShop ? '#2563eb' : isCompany ? '#059669' : 'var(--accent)'}
              />
              <span>{role.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
