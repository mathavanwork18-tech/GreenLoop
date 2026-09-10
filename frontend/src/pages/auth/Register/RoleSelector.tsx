import Icon from '../../../components/Icon'
import type { Role } from '../../../types/auth.types'
import type { IconName } from '../../../components/Icon'

interface RoleSelectorProps {
  selectedRole: Role | null
  onSelect: (role: Role) => void
  onContinue: () => void
}

const ROLES: { id: Role; icon: IconName; name: string; desc: string; color: string; bg: string }[] = [
  {
    id: 'GENERAL_USER',
    icon: 'user',
    name: 'General User',
    desc: 'Scan, sell, donate, repair, recycle your e-waste. Earn Green Coins.',
    color: '#059669',
    bg: '#d1fae5'
  },
  {
    id: 'LOCAL_SHOP',
    icon: 'shop',
    name: 'Local Shop',
    desc: 'Buy/sell electronics, offer repair services, collect e-waste.',
    color: '#2563eb',
    bg: '#dbeafe'
  },
  {
    id: 'RECYCLER',
    icon: 'recycle',
    name: 'Recycling Company',
    desc: 'Accept e-waste, manage pickups, issue recycling certificates.',
    color: '#7c3aed',
    bg: '#ede9fe'
  },
]

export default function RoleSelector({ selectedRole, onSelect, onContinue }: RoleSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROLES.map(role => (
        <div
          key={role.id}
          onClick={() => onSelect(role.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 14,
            border: `2px solid ${selectedRole === role.id ? role.color : 'var(--border-color)'}`,
            background: selectedRole === role.id ? role.bg : 'var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: role.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${role.color}30`
            }}
          >
            <Icon name={role.icon} size={24} color={role.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 3 }}>
              {role.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{role.desc}</div>
          </div>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${selectedRole === role.id ? role.color : 'var(--border-color)'}`,
              background: selectedRole === role.id ? role.color : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.7rem',
              flexShrink: 0
            }}
          >
            {selectedRole === role.id && <Icon name="check" size={11} color="#fff" />}
          </div>
        </div>
      ))}

      <button
        className="btn btn-primary btn-lg btn-full"
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        disabled={!selectedRole}
        onClick={onContinue}
      >
        <span>Continue</span>
        <Icon name="arrow-right" size={16} color="#fff" />
      </button>
    </div>
  )
}
