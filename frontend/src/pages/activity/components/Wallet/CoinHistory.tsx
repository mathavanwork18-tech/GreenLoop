import type { CoinTransaction } from '../../../../types/activity.types'
import Icon from '../../../../components/Icon'

interface CoinHistoryProps {
  transactions: CoinTransaction[]
  onQuickRedeem: () => void
}

export default function CoinHistory({ transactions, onQuickRedeem }: CoinHistoryProps) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Green Coin Transactions ({transactions.length})</span>
        <span className="section-link" onClick={onQuickRedeem}>
          + Quick 100 Coins
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {transactions.map(item => {
          const isPositive = typeof item.amount === 'number' ? item.amount > 0 : !item.amount.startsWith('-')
          const amountText = typeof item.amount === 'number' ? (isPositive ? `+${item.amount}` : `${item.amount}`) : item.amount

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: item.status === 'Completed' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                background: item.status === 'Completed' ? 'var(--accent-light)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isPositive ? 'var(--coin-bg)' : 'rgba(239,68,68,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name={isPositive ? 'coin' : 'refresh'} size={18} color={isPositive ? 'var(--coin-color)' : '#ef4444'} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {item.title || item.label}
                  </strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {item.time || item.date} • Verified Action
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: isPositive ? '#059669' : '#ef4444'
                }}
              >
                {amountText}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
