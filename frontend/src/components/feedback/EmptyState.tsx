import type { ReactNode } from 'react'
import Icon from '../Icon'
import type { IconName } from '../Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon = 'recycle', title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--accent-light)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px'
        }}
      >
        <Icon name={icon} size={24} color="var(--accent)" />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.4 }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
