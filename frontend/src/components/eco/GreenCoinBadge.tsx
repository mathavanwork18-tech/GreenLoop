import Icon from '../Icon'

interface GreenCoinBadgeProps {
  coins: number | undefined
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showLabel?: boolean
}

export default function GreenCoinBadge({ coins = 0, size = 'md', onClick, showLabel = false }: GreenCoinBadgeProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? 4 : isLg ? 8 : 6,
        background: 'var(--coin-bg)',
        border: '1px solid var(--coin-border)',
        padding: isSm ? '3px 8px' : isLg ? '6px 14px' : '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontWeight: 800,
        fontSize: isSm ? '0.72rem' : isLg ? '0.95rem' : '0.8rem',
        color: 'var(--coin-color)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.15s ease'
      }}
    >
      <Icon name="coin" size={isSm ? 13 : isLg ? 20 : 16} color="var(--coin-color)" />
      <span>{coins.toLocaleString()}</span>
      {showLabel && <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>Coins</span>}
    </div>
  )
}
