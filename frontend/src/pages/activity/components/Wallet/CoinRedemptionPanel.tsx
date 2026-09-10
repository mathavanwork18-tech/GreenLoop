import { useState } from 'react'
import Icon from '../../../../components/Icon'

interface CoinRedemptionPanelProps {
  onRedeem: (code: string) => void
  successMessage: string | null
}

export default function CoinRedemptionPanel({ onRedeem, successMessage }: CoinRedemptionPanelProps) {
  const [code, setCode] = useState('')

  const handleApply = (codeToApply?: string) => {
    const val = (codeToApply || code).trim()
    if (!val) return
    onRedeem(val)
    setCode('')
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        border: '1.5px dashed rgba(52, 211, 153, 0.4)',
        marginTop: 14
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="gift" size={15} color="#34d399" />
          <span>Redeem Coins / Promo Code</span>
        </span>
        <span style={{ fontSize: '0.68rem', color: '#a7f3d0', fontWeight: 600 }}>Instant Wallet Credit</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          placeholder="Enter code (e.g. ECO100, GREEN500)..."
          value={code}
          onChange={e => setCode(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '0.82rem',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleApply()}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}
        >
          Redeem
        </button>
      </div>

      {/* Quick Faucet Pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
        {[
          { code: 'ECO50', label: '+50 Drop Token' },
          { code: 'ECO100', label: '+100 Daily Voucher' },
          { code: 'CLEAN250', label: '+250 Drive Reward' },
          { code: 'GREEN500', label: '+500 Mega Grant' },
        ].map(pill => (
          <button
            key={pill.code}
            onClick={() => handleApply(pill.code)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              color: '#d1fae5',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {successMessage && (
        <div
          style={{
            marginTop: 10,
            background: '#047857',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Icon name="sparkles" size={15} color="#fff" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  )
}
