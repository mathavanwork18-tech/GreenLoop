import { formatCurrency } from '../../utils/formatting'

interface PaymentProcessingProps {
  amount: number
  postTitle: string
}

export default function PaymentProcessing({ amount, postTitle }: PaymentProcessingProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px 28px',
        textAlign: 'center',
      }}
    >
      {/* Calm Circular Progress Animation */}
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 22 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(0, 255, 156, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#00FF9C',
            borderRightColor: '#00C2FF',
            animation: 'spin 1.1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
          }}
        />
      </div>

      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E6EDF3', marginBottom: 4 }}>
        Processing Payment
      </div>

      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00FF9C', margin: '4px 0 6px' }}>
        {formatCurrency(amount)}
      </div>

      <div
        style={{
          fontSize: '0.85rem',
          color: '#8B949E',
          maxWidth: 300,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 14,
        }}
      >
        {postTitle}
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 18px',
          fontSize: '0.8rem',
          color: '#8B949E',
          lineHeight: 1.5,
          maxWidth: 340,
        }}
      >
        <p style={{ margin: 0 }}>We're securely confirming your payment with the banking network.</p>
        <p style={{ margin: '6px 0 0', color: '#E6EDF3', fontWeight: 600 }}>Please don't close this window.</p>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#8B949E', marginTop: 18 }}>
        Transaction ID: <span style={{ color: '#E6EDF3', fontFamily: 'monospace' }}>Pending verification...</span>
      </div>
    </div>
  )
}
