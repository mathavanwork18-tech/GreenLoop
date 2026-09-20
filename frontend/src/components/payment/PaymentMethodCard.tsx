import Icon, { type IconName } from '../Icon'
import type { PaymentMethod } from '../../types/payment.types'

interface PaymentMethodCardProps {
  method: PaymentMethod
  title: string
  subtitle: string
  desc: string
  icon: IconName
  selected: boolean
  onSelect: () => void
}

export default function PaymentMethodCard({
  method,
  title,
  subtitle,
  desc,
  icon,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const isOnline = method === 'ONLINE'
  const accentColor = '#00FF9C'
  const brandBlue = '#00C2FF'

  return (
    <div
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 16px',
        borderRadius: '14px',
        background: selected ? 'rgba(0, 255, 156, 0.07)' : 'rgba(22, 27, 34, 0.75)',
        border: selected ? `2px solid ${accentColor}` : '1px solid rgba(255, 255, 255, 0.12)',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selected ? '0 4px 18px rgba(0, 255, 156, 0.12)' : 'none',
        outline: 'none',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: '10px',
          background: selected
            ? isOnline
              ? 'rgba(0, 194, 255, 0.15)'
              : 'rgba(0, 255, 156, 0.15)'
            : 'rgba(255, 255, 255, 0.05)',
          border: selected
            ? `1px solid ${isOnline ? brandBlue : accentColor}40`
            : '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={20} color={selected ? (isOnline ? brandBlue : accentColor) : '#8B949E'} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#E6EDF3' }}>
            {title}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              background: isOnline ? 'rgba(0, 194, 255, 0.12)' : 'rgba(0, 255, 156, 0.12)',
              color: isOnline ? brandBlue : accentColor,
            }}
          >
            {subtitle}
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#8B949E', marginTop: 3, lineHeight: 1.4 }}>
          {desc}
        </div>
      </div>

      {/* Radio Indicator */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: selected ? `2px solid ${accentColor}` : '2px solid rgba(255, 255, 255, 0.25)',
          background: selected ? accentColor : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
          transition: 'all 0.15s ease',
        }}
      >
        {selected && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#0D1117',
            }}
          />
        )}
      </div>
    </div>
  )
}
