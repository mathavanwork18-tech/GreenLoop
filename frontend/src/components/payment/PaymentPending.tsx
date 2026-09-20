import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'
import type { MarketplacePurchase } from '../../types/payment.types'

interface PaymentPendingProps {
  purchase: MarketplacePurchase
  onCheckStatus: () => void
  onGoToTransactions: () => void
  isChecking?: boolean
}

export default function PaymentPending({
  purchase,
  onCheckStatus,
  onGoToTransactions,
  isChecking = false,
}: PaymentPendingProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 16px 20px',
        textAlign: 'center',
      }}
    >
      {/* Subtle Pulsing Progress Indicator */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(0, 194, 255, 0.12)',
          border: '2px dashed #00C2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          animation: 'spin 12s linear infinite',
        }}
      >
        <Icon name="refresh" size={26} color="#00C2FF" />
      </div>

      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E6EDF3', marginBottom: 4 }}>
        Confirming Payment
      </div>

      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00C2FF', margin: '4px 0' }}>
        {formatCurrency(purchase.total)}
      </div>

      <div style={{ fontSize: '0.84rem', color: '#8B949E', maxWidth: 320, marginBottom: 16 }}>
        We are checking your transaction status with the payment gateway.
      </div>

      {/* Safety Notice: Don't Pay Twice! */}
      <div
        style={{
          width: '100%',
          background: 'rgba(0, 194, 255, 0.08)',
          border: '1px solid rgba(0, 194, 255, 0.25)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: 20,
          textAlign: 'left',
          fontSize: '0.82rem',
          color: '#E6EDF3',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#00C2FF', marginBottom: 4 }}>
          <Icon name="shield" size={15} color="#00C2FF" />
          <span>You do NOT need to pay again</span>
        </div>
        <div>
          If your bank debited your account, your payment will be confirmed automatically via webhook without duplicate charges.
        </div>
      </div>

      {/* Status Details */}
      <div
        style={{
          width: '100%',
          background: 'rgba(22, 27, 34, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: 20,
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Purchase ID</span>
          <span style={{ color: '#E6EDF3', fontFamily: 'monospace' }}>{purchase.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Current Status</span>
          <span style={{ color: '#00C2FF', fontWeight: 700 }}>Verification in progress</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onCheckStatus}
          disabled={isChecking}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 194, 255, 0.15)',
            border: '1px solid #00C2FF',
            color: '#00C2FF',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: isChecking ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="refresh" size={15} color="#00C2FF" />
          <span>{isChecking ? 'Checking Bank Status...' : 'Check Status Now'}</span>
        </button>

        <button
          onClick={onGoToTransactions}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#E6EDF3',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to Transactions
        </button>
      </div>
    </div>
  )
}
