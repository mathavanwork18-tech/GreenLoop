import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'

interface PaymentFailedProps {
  amount: number
  reason?: string
  onRetry: () => void
  onChooseAnotherMethod: () => void
  onBack: () => void
}

export default function PaymentFailed({
  amount,
  reason = 'The payment could not be authorized by your bank.',
  onRetry,
  onChooseAnotherMethod,
  onBack,
}: PaymentFailedProps) {
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
      {/* Gentle Error Indicator */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon name="alert" size={28} color="#ef4444" />
      </div>

      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E6EDF3', marginBottom: 4 }}>
        Payment Failed
      </div>

      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f87171', margin: '4px 0 10px' }}>
        {formatCurrency(amount)}
      </div>

      <div
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: '#fca5a5',
          lineHeight: 1.4,
          maxWidth: 340,
          marginBottom: 20,
        }}
      >
        <span>{reason}</span>
      </div>

      {/* Action Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onRetry}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
            border: 'none',
            color: '#0D1117',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="refresh" size={15} color="#0D1117" />
          <span>Try Again</span>
        </button>

        <button
          onClick={onChooseAnotherMethod}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#E6EDF3',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Choose Cash on Handover
        </button>

        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#8B949E',
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: '6px',
            marginTop: 4,
          }}
        >
          Cancel & Return to Listing
        </button>
      </div>
    </div>
  )
}
