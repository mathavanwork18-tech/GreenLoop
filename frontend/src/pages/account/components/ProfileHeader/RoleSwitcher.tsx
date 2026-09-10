import { ROLES } from '../../../../constants/roles'
import type { Role } from '../../../../types/auth.types'

interface RoleSwitcherProps {
  currentRole: Role
  onSelectRole: (role: Role) => void
}

export default function RoleSwitcher({ currentRole, onSelectRole }: RoleSwitcherProps) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        Interactive Sandbox: Switch Account Role
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            style={{
              background: currentRole === role.id ? 'var(--accent)' : 'var(--bg-surface-2)',
              color: currentRole === role.id ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  )
}
