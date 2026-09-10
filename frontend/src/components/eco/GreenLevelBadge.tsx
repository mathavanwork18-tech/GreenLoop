import Icon from '../Icon'
import type { IconName } from '../Icon'

interface GreenLevelBadgeProps {
  level: string
  icon?: IconName
}

export default function GreenLevelBadge({ level, icon = 'leaf' }: GreenLevelBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--accent-light)',
        color: 'var(--accent-text)',
        fontSize: '0.72rem',
        fontWeight: 800,
        padding: '3px 9px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--accent)'
      }}
    >
      <Icon name={icon} size={12} color="var(--accent)" />
      <span>{level}</span>
    </span>
  )
}
