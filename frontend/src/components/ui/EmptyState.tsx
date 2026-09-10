import React from 'react'
import Icon, { type IconName } from '../Icon'
import Button from './Button'

export interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  style?: React.CSSProperties
}

export default function EmptyState({
  icon = 'recycle',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  return (
    <div
      className="empty-state"
      style={{
        padding: '36px 20px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        ...style,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Icon name={icon} size={26} color="var(--accent)" />
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            maxWidth: 340,
            margin: '4px 0 16px',
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
