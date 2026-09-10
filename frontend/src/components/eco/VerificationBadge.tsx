import Icon from '../Icon'

interface VerificationBadgeProps {
  label?: string
  size?: number
}

export default function VerificationBadge({ label, size = 13 }: VerificationBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        fontSize: '0.68rem',
        fontWeight: 800,
        padding: label ? '2px 7px' : '2px',
        borderRadius: 'var(--radius-full)'
      }}
    >
      <Icon name="verified" size={size} color="#059669" />
      {label && <span>{label}</span>}
    </span>
  )
}
